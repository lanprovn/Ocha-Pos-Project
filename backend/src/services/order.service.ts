import prisma from '@config/database';
import { CreateOrderInput, OrderFilters, UpdateOrderStatusInput, UpdateOrderInput, OrderWithItems, Order, HoldOrderInput, CancelOrderInput, ReturnOrderInput, SplitOrderInput, MergeOrdersInput } from '@core/types/order.types';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import recipeService from './recipe.service';
import stockService from './stock.service';
import customerService from './customer.service';
import logger from '@utils/logger';
import { InsufficientStockError, OrderNotFoundError, ValidationError } from '@core/errors';
import { emitStockUpdated, emitOrderCreated, emitOrderUpdated, emitOrderStatusChanged, emitOrderVerified, emitDraftOrdersDeleted } from '@core/socket/socket.io';
import { StockTransactionType, OrderStatus } from '@core/types/common.types';
import { calculateMembershipLevel } from '@config/membership.config';

export class OrderService {
  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    return `ORD-${timestamp}`;
  }

  /**
   * Create or update draft order (cart đang tạo)
   * Tìm draft order theo orderCreator và orderCreatorName, nếu có thì update, không thì tạo mới
   */
  async createOrUpdateDraft(data: CreateOrderInput) {
    try {
      // Calculate total amount from items
      const totalAmount = data.items.reduce((sum, item) => {
        return sum + item.subtotal;
      }, 0);

      // Tìm draft order đang tạo (status = CREATING) của cùng một người tạo
      const existingDraft = await prisma.order.findFirst({
        where: {
          status: 'CREATING',
          orderCreator: data.orderCreator || 'STAFF',
          orderCreatorName: data.orderCreatorName || null,
        },
        include: {
          items: true,
        },
      });

      if (existingDraft) {
        // Update existing draft order
        // Xóa items cũ và tạo items mới
        await prisma.orderItem.deleteMany({
          where: { orderId: existingDraft.id },
        });

        const updated = await prisma.order.update({
          where: { id: existingDraft.id },
          data: {
            totalAmount: new Decimal(totalAmount),
            customerName: data.customerName || null,
            customerPhone: data.customerPhone || null,
            customerTable: data.customerTable || null,
            notes: data.notes || null,
            items: {
              create: data.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: new Decimal(item.price),
                subtotal: new Decimal(item.subtotal),
                selectedSize: item.selectedSize || null,
                selectedToppings: item.selectedToppings || [],
                note: item.note || null,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        const transformedOrder = this.transformOrder(updated);
        
        // Emit Socket.io event for real-time updates (after successful update)
        emitOrderUpdated(transformedOrder);
        
        return transformedOrder;
      } else {
        // Create new draft order
        let orderNumber = this.generateOrderNumber();
        let attempts = 0;

        // Ensure unique order number
        while (attempts < 10) {
          const existing = await prisma.order.findUnique({
            where: { orderNumber },
          });

          if (!existing) break;

          orderNumber = this.generateOrderNumber();
          attempts++;
        }

        const order = await prisma.order.create({
          data: {
            orderNumber,
            status: 'CREATING',
            totalAmount: new Decimal(totalAmount),
            customerName: data.customerName || null,
            customerPhone: data.customerPhone || null,
            customerTable: data.customerTable || null,
            notes: data.notes || null,
            paymentMethod: null,
            paymentStatus: 'PENDING',
            orderCreator: data.orderCreator || 'STAFF',
            orderCreatorName: data.orderCreatorName || null,
            items: {
              create: data.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: new Decimal(item.price),
                subtotal: new Decimal(item.subtotal),
                selectedSize: item.selectedSize || null,
                selectedToppings: item.selectedToppings || [],
                note: item.note || null,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        const transformedOrder = this.transformOrder(order);
        
        // Emit Socket.io event for real-time updates (after successful creation)
        emitOrderUpdated(transformedOrder);
        
        return transformedOrder;
      }
    } catch (error) {
      logger.error('Error in createOrUpdateDraft', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        data: {
          itemsCount: data.items?.length || 0,
          orderCreator: data.orderCreator,
          orderCreatorName: data.orderCreatorName,
        },
      });
      throw error;
    }
  }

  /**
   * Delete draft orders (CREATING) của cùng orderCreator
   * Returns deleted order IDs để emit socket event
   */
  async deleteDraftOrders(orderCreator: 'STAFF' | 'CUSTOMER', orderCreatorName?: string | null): Promise<string[]> {
    try {
      // Find draft orders first để lấy IDs
      const draftOrders = await prisma.order.findMany({
        where: {
          status: 'CREATING',
          orderCreator,
          orderCreatorName: orderCreatorName || null,
        },
        select: {
          id: true,
        },
      });

      const deletedIds = draftOrders.map(order => order.id);

      // Delete draft orders
      await prisma.order.deleteMany({
        where: {
          status: 'CREATING',
          orderCreator,
          orderCreatorName: orderCreatorName || null,
        },
      });

      // Emit socket event để realtime update
      if (deletedIds.length > 0) {
        emitDraftOrdersDeleted(deletedIds, orderCreator, orderCreatorName);
      }

      return deletedIds;
    } catch (error) {
      logger.error('Error deleting draft orders', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Không throw error để không block flow
      return [];
    }
  }

  /**
   * Delete ALL CREATING orders (Admin only - for cleanup)
   * Returns deleted order IDs để emit socket event
   */
  async deleteAllDraftOrders(): Promise<string[]> {
    try {
      // Find all CREATING orders
      const draftOrders = await prisma.order.findMany({
        where: {
          status: 'CREATING',
        },
        select: {
          id: true,
          orderCreator: true,
          orderCreatorName: true,
        },
      });

      const deletedIds = draftOrders.map(order => order.id);

      if (deletedIds.length === 0) {
        return [];
      }

      // Delete all CREATING orders
      await prisma.order.deleteMany({
        where: {
          status: 'CREATING',
        },
      });

      // Emit socket events for each orderCreator group
      const groupedByCreator = draftOrders.reduce((acc, order) => {
        const key = `${order.orderCreator || 'STAFF'}_${order.orderCreatorName || 'null'}`;
        if (!acc[key]) {
          acc[key] = {
            orderCreator: (order.orderCreator || 'STAFF') as 'STAFF' | 'CUSTOMER',
            orderCreatorName: order.orderCreatorName,
            ids: [],
          };
        }
        acc[key].ids.push(order.id);
        return acc;
      }, {} as Record<string, { orderCreator: 'STAFF' | 'CUSTOMER'; orderCreatorName: string | null; ids: string[] }>);

      // Emit socket events
      Object.values(groupedByCreator).forEach((group) => {
        if (group.ids.length > 0) {
          emitDraftOrdersDeleted(group.ids, group.orderCreator, group.orderCreatorName);
        }
      });

      logger.info(`Deleted ${deletedIds.length} CREATING orders`);
      return deletedIds;
    } catch (error) {
      logger.error('Error deleting all draft orders', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return [];
    }
  }

  /**
   * Tự động trừ tồn kho sản phẩm và nguyên liệu khi order completed
   * @param order - Order object với items
   * @param tx - Optional transaction client (nếu có thì dùng transaction, không thì dùng prisma thường)
   * @returns Array of stock updates để emit socket events và check alerts sau transaction commit
   */
  private async deductIngredientsFromOrder(
    order: OrderWithItems,
    tx?: Prisma.TransactionClient
  ): Promise<Array<{ type: 'product' | 'ingredient'; id: string; productId?: string; ingredientId?: string; quantity: number }>> {
    const prismaClient = tx || prisma;
    const stockUpdates: Array<{ type: 'product' | 'ingredient'; id: string; productId?: string; ingredientId?: string; quantity: number }> = [];

    try {
      if (!order.items || order.items.length === 0) {
        return stockUpdates;
      }

      // 1. Trừ tồn kho sản phẩm
      // Nếu đang trong transaction, tạo transaction record và update stock trực tiếp
      for (const item of order.items) {
        try {
          if (tx) {
            // Trong transaction: tạo transaction record và update stock
            await prismaClient.stockTransaction.create({
              data: {
                productId: item.productId,
                type: StockTransactionType.SALE,
                quantity: item.quantity,
                reason: `Tự động trừ từ đơn hàng ${order.orderNumber}`,
              },
            });

            // Get stock info before update để track changes
            const stockBefore = await prismaClient.stock.findUnique({
              where: { productId: item.productId },
            });

            // Update stock quantity
            await prismaClient.stock.updateMany({
              where: { productId: item.productId },
              data: {
                quantity: { decrement: item.quantity },
                lastUpdated: new Date(),
              },
            });

            // Track stock update để emit events sau transaction commit
            if (stockBefore) {
              stockUpdates.push({
                type: 'product',
                id: stockBefore.id,
                productId: item.productId,
                quantity: item.quantity,
              });
            }
          } else {
            // Không trong transaction: dùng service như cũ
            await stockService.createTransaction({
              productId: item.productId,
              type: StockTransactionType.SALE,
              quantity: item.quantity,
              reason: `Tự động trừ từ đơn hàng ${order.orderNumber}`,
            });
          }
        } catch (error) {
          logger.error('Error deducting product stock', {
            productId: item.productId,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          // Trong transaction, throw error để rollback
          if (tx) {
            throw error;
          }
          // Không trong transaction: tiếp tục với các sản phẩm khác
        }
      }

      // 2. Trừ nguyên liệu theo recipe
      const productIds = order.items.map((item) => item.productId);

      // Lấy tất cả recipes cho các sản phẩm này
      const recipes = await recipeService.getByProducts(productIds);

      if (recipes.length === 0) {
        return stockUpdates; // Không có recipe, không cần trừ nguyên liệu
      }

      // Tính tổng nguyên liệu cần trừ (theo số lượng sản phẩm trong order)
      const ingredientDeductions: Record<string, number> = {};

      order.items.forEach((item) => {
        const itemQuantity = item.quantity;
        const productRecipes = recipes.filter((r) => r.productId === item.productId);

        productRecipes.forEach((recipe) => {
          const ingredientId = recipe.ingredientId;
          const recipeQuantity = parseFloat(recipe.quantity);
          const totalNeeded = recipeQuantity * itemQuantity;

          if (!ingredientDeductions[ingredientId]) {
            ingredientDeductions[ingredientId] = 0;
          }
          ingredientDeductions[ingredientId] += totalNeeded;
        });
      });

      // Trừ nguyên liệu từ stock và tạo transaction
      for (const [ingredientId, totalQuantity] of Object.entries(ingredientDeductions)) {
        try {
          const quantityToDeduct = Math.ceil(totalQuantity);

          if (tx) {
            // Trong transaction: tạo transaction record và update stock
            await prismaClient.stockTransaction.create({
              data: {
                ingredientId,
                type: StockTransactionType.SALE,
                quantity: quantityToDeduct,
                reason: `Tự động trừ từ đơn hàng ${order.orderNumber}`,
              },
            });

            // Get ingredient stock info before update để track changes
            const ingredientStockBefore = await prismaClient.ingredientStock.findUnique({
              where: { ingredientId },
            });

            // Update ingredient stock quantity
            await prismaClient.ingredientStock.updateMany({
              where: { ingredientId },
              data: {
                quantity: { decrement: quantityToDeduct },
                lastUpdated: new Date(),
              },
            });

            // Track stock update để emit events sau transaction commit
            if (ingredientStockBefore) {
              stockUpdates.push({
                type: 'ingredient',
                id: ingredientStockBefore.id,
                ingredientId,
                quantity: quantityToDeduct,
              });
            }
          } else {
            // Không trong transaction: dùng service như cũ
            await stockService.createTransaction({
              ingredientId,
              type: StockTransactionType.SALE,
              quantity: quantityToDeduct,
              reason: `Tự động trừ từ đơn hàng ${order.orderNumber}`,
            });
          }
        } catch (error) {
          logger.error('Error deducting ingredient', {
            ingredientId,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          // Trong transaction, throw error để rollback
          if (tx) {
            throw error;
          }
          // Không trong transaction: tiếp tục với các nguyên liệu khác
        }
      }

      return stockUpdates;
    } catch (error) {
      logger.error('Error deducting stock from order', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Trong transaction, throw error để rollback
      if (tx) {
        throw error;
      }
      // Không trong transaction: return empty array
      return stockUpdates;
    }
  }

  /**
   * Emit socket events và check stock alerts sau khi transaction commit thành công
   */
  private async emitStockUpdatesAndCheckAlerts(
    stockUpdates: Array<{ type: 'product' | 'ingredient'; id: string; productId?: string; ingredientId?: string; quantity: number }>
  ): Promise<void> {
    for (const update of stockUpdates) {
      try {
        // Get current stock info sau khi đã update
        type StockWithProduct = Awaited<ReturnType<typeof prisma.stock.findUnique<{ include: { product: true } }>>>;
        type IngredientStockWithIngredient = Awaited<ReturnType<typeof prisma.ingredientStock.findUnique<{ include: { ingredient: true } }>>>;
        type StockUnion = StockWithProduct | IngredientStockWithIngredient;
        
        let stock: StockUnion = null;
        let oldQuantity: number | undefined;

        if (update.type === 'product' && update.productId) {
          const stockData = await prisma.stock.findUnique({
            where: { id: update.id },
            include: { product: true },
          });
          if (stockData) {
            stock = stockData;
            oldQuantity = stockData.quantity + update.quantity; // Reverse calculate old quantity
          }
        } else if (update.type === 'ingredient' && update.ingredientId) {
          const stockData = await prisma.ingredientStock.findUnique({
            where: { id: update.id },
            include: { ingredient: true },
          });
          if (stockData) {
            stock = stockData;
            oldQuantity = stockData.quantity + update.quantity; // Reverse calculate old quantity
          }
        }

        if (stock && oldQuantity !== undefined) {
          // Emit socket event
          emitStockUpdated({
            type: update.type,
            productId: update.productId,
            ingredientId: update.ingredientId,
            stockId: update.id,
            oldQuantity,
            newQuantity: stock.quantity,
          });

          // Check and create stock alerts
          await stockService.checkAndCreateStockAlertPublic({
            type: update.type,
            stockId: update.id,
            productId: update.productId || undefined,
            ingredientId: update.ingredientId || undefined,
            currentQuantity: stock.quantity,
            minStock: stock.minStock,
            productName: update.type === 'product' ? (stock as any).product?.name : undefined,
            ingredientName: update.type === 'ingredient' ? (stock as any).ingredient?.name : undefined,
          });
        }
      } catch (error) {
        // Log error nhưng không throw để không block order completion
        logger.error('Error emitting stock updates or checking alerts', {
          update,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
  }

  /**
   * Create new order
   * Sử dụng transaction để đảm bảo atomicity và tránh race conditions
   */
  async create(data: CreateOrderInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Xóa draft orders cũ của cùng orderCreator trong transaction
      await tx.order.deleteMany({
        where: {
          status: 'CREATING',
          orderCreator: data.orderCreator || 'STAFF',
          orderCreatorName: data.orderCreatorName || null,
        },
      });

      // 2. Validate stock availability với transaction isolation
      for (const item of data.items) {
        const stock = await tx.stock.findUnique({
          where: { productId: item.productId },
        });

        if (stock) {
          if (stock.quantity < item.quantity) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });
            throw new InsufficientStockError(
              item.productId,
              product?.name || item.productId,
              stock.quantity,
              item.quantity
            );
          }
        }
      }

      // 3. Calculate total amount from items
      const totalAmount = data.items.reduce((sum, item) => {
        return sum + item.subtotal;
      }, 0);

      // 3.5. Find or create customer by phone number (within transaction)
      let customerId: string | null = null;
      if (data.customerPhone) {
        customerId = await customerService.findOrCreateByPhone(
          data.customerPhone,
          data.customerName || undefined,
          tx // Pass transaction client
        );
      }

      // 4. Generate unique order number trong transaction
      let orderNumber = this.generateOrderNumber();
      let attempts = 0;

      while (attempts < 10) {
        const existing = await tx.order.findUnique({
          where: { orderNumber },
        });

        if (!existing) break;

        orderNumber = this.generateOrderNumber();
        attempts++;
      }

      if (attempts >= 10) {
        throw new Error('Không thể tạo order number duy nhất sau 10 lần thử');
      }

      // 4.5. Determine initial status based on orderCreator
      // CUSTOMER orders start as PENDING (require verification)
      // STAFF orders start as CONFIRMED (auto-approved)
      const orderCreator = data.orderCreator || 'STAFF';
      const initialStatus = orderCreator === 'CUSTOMER' ? 'PENDING' : 'CONFIRMED';
      const confirmedBy = orderCreator === 'STAFF' ? data.orderCreatorName || null : null;
      const confirmedAt = orderCreator === 'STAFF' ? new Date() : null;

      // 5. Create order with items trong transaction
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: initialStatus,
          totalAmount: new Decimal(totalAmount),
          customerName: data.customerName || null,
          customerPhone: data.customerPhone || null,
          customerId: customerId, // Link to customer if found/created
          customerTable: data.customerTable || null,
          notes: data.notes || null,
          paymentMethod: data.paymentMethod || null,
          paymentStatus: data.paymentStatus || 'PENDING',
          orderCreator: orderCreator,
          orderCreatorName: data.orderCreatorName || null,
          confirmedBy: confirmedBy,
          confirmedAt: confirmedAt,
          paidAt: data.paymentStatus === 'SUCCESS' ? new Date() : null,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: new Decimal(item.price),
              subtotal: new Decimal(item.subtotal),
              selectedSize: item.selectedSize || null,
              selectedToppings: item.selectedToppings || [],
              note: item.note || null,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 6. Trừ tồn kho khi order được CONFIRMED (để tránh overselling)
      // Loyalty points sẽ được xử lý khi order chuyển sang COMPLETED
      let stockUpdates: Array<{ type: 'product' | 'ingredient'; id: string; productId?: string; ingredientId?: string; quantity: number }> = [];
      
      // Nếu order được tạo với status CONFIRMED (STAFF orders), trừ tồn kho ngay
      if (initialStatus === 'CONFIRMED') {
        stockUpdates = await this.deductIngredientsFromOrder(order, tx);
      }

      // ✅ Tất cả operations atomic - hoặc thành công hết hoặc rollback hết
      const transformedOrder = this.transformOrder(order);
      
      return { order: transformedOrder, stockUpdates };
    }).then(async ({ order, stockUpdates }) => {
      // ✅ Emit socket events và check alerts SAU KHI transaction commit thành công
      if (stockUpdates.length > 0) {
        await this.emitStockUpdatesAndCheckAlerts(stockUpdates);
      }
      
      // Emit Socket.io event for real-time updates (AFTER transaction commits successfully)
      emitOrderCreated(order);
      return order;
    });
  }

  /**
   * Get all orders with filters and pagination
   * Handles all business logic: parsing params, calculating pagination, fetching data and count
   * @param filters - Raw query parameters from request
   * @returns Paginated result with data and pagination metadata, or simple array if no pagination
   */
  async findAllWithPagination(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    page?: string | number;
    limit?: string | number;
  }): Promise<{ data: Order[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } | Order[]> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      where.createdAt = { ...where.createdAt, gte: startDate };
    }

    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    // Parse pagination params
    const page = filters?.page ? parseInt(filters.page as string, 10) : undefined;
    const limit = filters?.limit ? parseInt(filters.limit as string, 10) : undefined;

    // If pagination is used, fetch data and count, then return structured result
    if (page && limit) {
      const skip = (page - 1) * limit;

      // Fetch data and count in parallel
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: orders.map((order) => this.transformOrder(order)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } else {
      // Return all orders (no pagination)
      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return orders.map((order) => this.transformOrder(order));
    }
  }

  /**
   * Get all orders with filters and pagination (legacy method for backward compatibility)
   * @deprecated Use findAllWithPagination instead
   */
  async findAll(filters?: OrderFilters) {
    return this.findAllWithPagination(filters);
  }

  /**
   * Get total count of orders matching filters (for pagination)
   */
  async getCount(filters?: OrderFilters): Promise<number> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      where.createdAt = { ...where.createdAt, gte: startDate };
    }

    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    return prisma.order.count({ where });
  }

  /**
   * Get today's orders
   * Load tất cả orders của hôm nay, bao gồm cả CREATING orders
   * Frontend sẽ tự filter CREATING orders không có items
   */
  async findToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        // Load tất cả orders của hôm nay, không filter CREATING theo thời gian
        // Frontend sẽ tự filter CREATING orders không có items
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.transformOrder(order));
  }

  /**
   * Get orders by date (YYYY-MM-DD)
   */
  async findByDate(date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.transformOrder(order));
  }

  /**
   * Get order by ID
   */
  async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    return this.transformOrder(order);
  }

  /**
   * Find order by phone number or order number
   * Used for customer order tracking
   */
  async findByPhoneOrOrderNumber(phoneOrOrderNumber: string) {
    if (!phoneOrOrderNumber || phoneOrOrderNumber.trim() === '') {
      throw new ValidationError('Vui lòng nhập số điện thoại hoặc mã đơn hàng');
    }

    const searchTerm = phoneOrOrderNumber.trim();

    // Normalize phone number (remove spaces, dashes, parentheses)
    const normalizedPhone = searchTerm.replace(/[\s\-\(\)]/g, '');

    // Try to find by orderNumber first (exact match)
    let order = await prisma.order.findUnique({
      where: { orderNumber: searchTerm },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // If not found by orderNumber, try to find by phone number
    // Phone numbers in DB might be stored in different formats, so we try multiple approaches
    if (!order) {
      // Get all orders with phone numbers (excluding CREATING status)
      const orders = await prisma.order.findMany({
        where: {
          customerPhone: {
            not: null,
          },
          status: {
            not: 'CREATING', // Exclude draft orders
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Most recent first
        },
      });

      // Find order by matching normalized phone numbers
      order = orders.find((o) => {
        if (!o.customerPhone) return false;
        // Normalize phone from database
        const dbPhoneNormalized = o.customerPhone.replace(/[\s\-\(\)]/g, '');
        // Compare normalized versions
        return dbPhoneNormalized === normalizedPhone || 
               dbPhoneNormalized.includes(normalizedPhone) ||
               normalizedPhone.includes(dbPhoneNormalized);
      }) || null;
    }

    if (!order) {
      throw new OrderNotFoundError(`Không tìm thấy đơn hàng với số điện thoại hoặc mã đơn hàng: ${searchTerm}`);
    }

    return this.transformOrder(order);
  }

  /**
   * Update order status
   */
  /**
   * Validate order status transition
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      CREATING: ['PENDING', 'CONFIRMED', 'HOLD', 'CANCELLED'],
      PENDING: ['CONFIRMED', 'HOLD', 'CANCELLED'],
      HOLD: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'HOLD', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // Final state - no transitions allowed
      CANCELLED: [], // Final state - no transitions allowed
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    if (!allowedStatuses.includes(newStatus)) {
      throw new ValidationError(
        `Không thể chuyển đơn hàng từ trạng thái ${currentStatus} sang ${newStatus}. Các trạng thái hợp lệ: ${allowedStatuses.join(', ')}`,
        { currentStatus, newStatus, allowedStatuses }
      );
    }
  }

  async updateStatus(id: string, data: UpdateOrderStatusInput) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new OrderNotFoundError(id);
      }

      // Validate status transition
      if (order.status !== data.status) {
        this.validateStatusTransition(order.status, data.status);
      }

      // Trừ tồn kho khi chuyển sang CONFIRMED (nếu chưa trừ)
      let stockUpdates: Array<{ type: 'product' | 'ingredient'; id: string; productId?: string; ingredientId?: string; quantity: number }> = [];
      
      if (data.status === 'CONFIRMED' && order.status !== 'CONFIRMED') {
        // Kiểm tra xem đã trừ tồn kho chưa bằng cách check stock transactions
        const hasStockTransaction = await tx.stockTransaction.findFirst({
          where: {
            productId: { in: order.items.map(item => item.productId) },
            reason: { contains: order.orderNumber },
          },
        });

        // Nếu chưa trừ tồn kho, trừ ngay khi CONFIRMED
        if (!hasStockTransaction) {
          stockUpdates = await this.deductIngredientsFromOrder(order, tx);
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: data.status,
          ...(data.status === 'COMPLETED' && !order.paidAt && {
            paidAt: new Date(),
            paymentStatus: 'SUCCESS',
          }),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Xử lý khi order chuyển sang COMPLETED:
      // 1. Xóa draft orders của cùng orderCreator
      // 2. Tích điểm loyalty (CHỈ KHI COMPLETED, không trùng lặp)
      if (data.status === 'COMPLETED') {
        // Xóa draft orders
        if (order.orderCreator) {
          await tx.order.deleteMany({
            where: {
              status: 'CREATING',
              orderCreator: order.orderCreator,
              orderCreatorName: order.orderCreatorName,
            },
          });
        }

        // Process loyalty points CHỈ KHI order chuyển sang COMPLETED và đã thanh toán
        // Kiểm tra xem đã tích điểm chưa bằng cách check loyalty_transactions
        const hasLoyaltyTransaction = await tx.loyalty_transactions.findFirst({
          where: {
            orderId: updated.id,
            type: 'EARN',
          },
        });

        if (!hasLoyaltyTransaction && updated.paymentStatus === 'SUCCESS' && updated.customerId) {
          const orderTotal = parseFloat(updated.totalAmount.toString());
          const pointsToEarn = Math.floor(orderTotal / 1000);
          
          const currentCustomer = await tx.customers.findUnique({
            where: { id: updated.customerId },
          });
          
          if (currentCustomer) {
            const newLoyaltyPoints = currentCustomer.loyaltyPoints + pointsToEarn;
            const newMembershipLevel = calculateMembershipLevel(newLoyaltyPoints);
            
            // Update customer totalSpent, loyaltyPoints, và membership level
            await tx.customers.update({
              where: { id: updated.customerId },
              data: {
                totalSpent: {
                  increment: new Decimal(orderTotal),
                },
                loyaltyPoints: newLoyaltyPoints,
                membershipLevel: newMembershipLevel,
                lastVisitAt: new Date(),
              },
            });

            // Create loyalty transaction record
            if (pointsToEarn > 0) {
              await tx.loyalty_transactions.create({
                data: {
                  id: `lt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  customerId: updated.customerId,
                  orderId: updated.id,
                  type: 'EARN',
                  points: pointsToEarn,
                  reason: `Tích điểm từ đơn hàng ${updated.orderNumber}`,
                },
              });
            }
          }
        }
      }

      // ✅ Tất cả operations atomic
      return {
        order: this.transformOrder(updated),
        stockUpdates,
      };
    }).then(async ({ order, stockUpdates }) => {
      // ✅ Emit socket events và check alerts SAU KHI transaction commit thành công
      if (stockUpdates.length > 0) {
        await this.emitStockUpdatesAndCheckAlerts(stockUpdates);
      }

      // Emit Socket.io events for real-time updates (after successful transaction commit)
      emitOrderUpdated(order);
      emitOrderStatusChanged(order.id, order.status);
      
      return order;
    });
  }

  /**
   * Update order (general update)
   */
  async update(id: string, data: UpdateOrderInput) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const updateData: Prisma.OrderUpdateInput = {};
      if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
      if (data.paymentTransactionId !== undefined) updateData.paymentTransactionId = data.paymentTransactionId;
      if (data.paymentDate !== undefined) updateData.paymentDate = data.paymentDate;
      if (data.status !== undefined) updateData.status = data.status;

      // Set paidAt when paymentStatus changes to SUCCESS
      if (data.paymentStatus === 'SUCCESS' && order.paymentStatus !== 'SUCCESS') {
        updateData.paidAt = new Date();
      }

      // NOTE: Loyalty points are processed ONLY when order status changes to COMPLETED
      // NOT here when paymentStatus changes, to avoid double processing

      const updated = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return this.transformOrder(updated);
    });
  }

  /**
   * Verify order (Staff confirms Customer order)
   * Changes status from PENDING to CONFIRMED
   */
  async verifyOrder(id: string, staffId: string, staffName?: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new OrderNotFoundError(id);
      }

      // Only PENDING orders can be verified
      if (order.status !== 'PENDING') {
        throw new ValidationError(
          `Đơn hàng ${order.orderNumber} không thể xác nhận. Trạng thái hiện tại: ${order.status}`,
          { orderId: id, orderNumber: order.orderNumber, currentStatus: order.status }
        );
      }

      // Only CUSTOMER orders can be verified
      if (order.orderCreator !== 'CUSTOMER') {
        throw new ValidationError(
          `Chỉ có thể xác nhận đơn hàng từ khách hàng. Đơn hàng này được tạo bởi ${order.orderCreator}`,
          { orderId: id, orderNumber: order.orderNumber, orderCreator: order.orderCreator }
        );
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedBy: staffName || staffId,
          confirmedAt: new Date(),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Trừ tồn kho khi order được verify (chuyển từ PENDING → CONFIRMED)
      let stockUpdates: Array<{ type: 'product' | 'ingredient'; id: string; productId?: string; ingredientId?: string; quantity: number }> = [];
      const hasStockTransaction = await tx.stockTransaction.findFirst({
        where: {
          productId: { in: order.items.map(item => item.productId) },
          reason: { contains: order.orderNumber },
        },
      });

      if (!hasStockTransaction) {
        stockUpdates = await this.deductIngredientsFromOrder(updated, tx);
      }

      const transformedOrder = this.transformOrder(updated);
      
      return { order: transformedOrder, stockUpdates };
    }).then(async ({ order, stockUpdates }) => {
      // Emit stock updates if any
      if (stockUpdates.length > 0) {
        await this.emitStockUpdatesAndCheckAlerts(stockUpdates);
      }
      
      // Emit Socket.io event for real-time updates
      emitOrderUpdated(order);
      emitOrderStatusChanged(order.id, order.status);
      
      // Emit special event for customer notification
      emitOrderVerified(order);
      
      return order;
    });
  }

  /**
   * Reject order (Staff rejects Customer order)
   * Changes status from PENDING to CANCELLED
   */
  async rejectOrder(id: string, reason?: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new OrderNotFoundError(id);
      }

      // Only PENDING orders can be rejected
      if (order.status !== 'PENDING') {
        throw new ValidationError(
          `Đơn hàng ${order.orderNumber} không thể từ chối. Trạng thái hiện tại: ${order.status}`,
          { orderId: id, orderNumber: order.orderNumber, currentStatus: order.status }
        );
      }

      // Only CUSTOMER orders can be rejected
      if (order.orderCreator !== 'CUSTOMER') {
        throw new ValidationError(
          `Chỉ có thể từ chối đơn hàng từ khách hàng. Đơn hàng này được tạo bởi ${order.orderCreator}`,
          { orderId: id, orderNumber: order.orderNumber, orderCreator: order.orderCreator }
        );
      }

      // Update notes with rejection reason if provided
      const updatedNotes = reason 
        ? `${order.notes ? order.notes + '\n' : ''}[REJECTED] ${reason}`
        : order.notes;

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: updatedNotes,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      const transformedOrder = this.transformOrder(updated);
      
      // Emit Socket.io event for real-time updates
      emitOrderUpdated(transformedOrder);
      emitOrderStatusChanged(transformedOrder.id, transformedOrder.status);
      
      return transformedOrder;
    });
  }

  /**
   * Get order by orderNumber (for payment callback)
   */
  async getByOrderNumber(orderNumber: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return this.transformOrder(order);
  }

  /**
   * Transform order to match frontend format
   */
  private transformOrder(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerTable: order.customerTable,
      notes: order.notes,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentTransactionId: order.paymentTransactionId,
      orderCreator: order.orderCreator,
      orderCreatorName: order.orderCreatorName,
      confirmedBy: order.confirmedBy || null,
      confirmedAt: order.confirmedAt ? order.confirmedAt.toISOString() : null,
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      paymentDate: order.paymentDate ? order.paymentDate.toISOString() : null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toString(),
        subtotal: item.subtotal.toString(),
        selectedSize: item.selectedSize,
        selectedToppings: item.selectedToppings,
        note: item.note,
        product: {
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
        },
      })),
    };
  }

  /**
   * Hold order (Lưu đơn hàng tạm)
   * Chuyển đơn hàng từ CREATING hoặc PENDING sang HOLD
   */
  async holdOrder(id: string, data: HoldOrderInput, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new OrderNotFoundError(id);
      }

      // Chỉ cho phép hold đơn ở trạng thái CREATING hoặc PENDING
      if (order.status !== 'CREATING' && order.status !== 'PENDING') {
        throw new Error(`Cannot hold order with status: ${order.status}`);
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: 'HOLD',
          holdName: data.holdName || `Đơn tạm - ${new Date().toLocaleString('vi-VN')}`,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      const transformedOrder = this.transformOrder(updated);
      emitOrderUpdated(transformedOrder);
      emitOrderStatusChanged(transformedOrder.id, transformedOrder.status);

      return transformedOrder;
    });
  }

  /**
   * Resume hold order (Khôi phục đơn hàng đã lưu)
   * Logic: 
   * - CUSTOMER orders → resume to PENDING (cần verification)
   * - STAFF orders → resume to CONFIRMED (đã được auto-confirm)
   */
  async resumeHoldOrder(id: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new OrderNotFoundError(id);
      }

      if (order.status !== 'HOLD') {
        throw new ValidationError(
          `Không thể khôi phục đơn hàng với trạng thái: ${order.status}. Chỉ có thể khôi phục đơn hàng đang ở trạng thái HOLD.`,
          { orderId: id, currentStatus: order.status }
        );
      }

      // Xác định status khi resume dựa trên orderCreator
      // CUSTOMER orders → PENDING (cần staff verification)
      // STAFF orders → CONFIRMED (đã được auto-confirm khi tạo)
      const resumeStatus = order.orderCreator === 'CUSTOMER' ? 'PENDING' : 'CONFIRMED';

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: resumeStatus,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Nếu resume về CONFIRMED và chưa trừ tồn kho, trừ ngay
      let stockUpdates: Array<{ type: 'product' | 'ingredient'; id: string; productId?: string; ingredientId?: string; quantity: number }> = [];
      if (resumeStatus === 'CONFIRMED') {
        const hasStockTransaction = await tx.stockTransaction.findFirst({
          where: {
            productId: { in: order.items.map(item => item.productId) },
            reason: { contains: order.orderNumber },
          },
        });

        if (!hasStockTransaction) {
          stockUpdates = await this.deductIngredientsFromOrder(updated, tx);
        }
      }

      const transformedOrder = this.transformOrder(updated);
      
      return { order: transformedOrder, stockUpdates };
    }).then(async ({ order, stockUpdates }) => {
      // Emit stock updates if any
      if (stockUpdates.length > 0) {
        await this.emitStockUpdatesAndCheckAlerts(stockUpdates);
      }
      
      emitOrderUpdated(order);
      emitOrderStatusChanged(order.id, order.status);

      return order;
    });
  }

  /**
   * Get all hold orders
   */
  async getHoldOrders(orderCreator?: 'STAFF' | 'CUSTOMER') {
    const where: Prisma.OrderWhereInput = {
      status: 'HOLD',
    };

    if (orderCreator) {
      where.orderCreator = orderCreator;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.transformOrder(order));
  }

  /**
   * Cancel order with reason and refund (Hủy đơn hàng nâng cao)
   */
  async cancelOrder(id: string, data: CancelOrderInput, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new OrderNotFoundError(id);
      }

      // Không cho phép hủy đơn đã COMPLETED hoặc đã CANCELLED
      if (order.status === 'COMPLETED') {
        throw new Error('Cannot cancel completed order');
      }
      if (order.status === 'CANCELLED') {
        throw new Error('Order is already cancelled');
      }

      // Tính toán refund amount nếu chưa có
      let refundAmount = data.refundAmount;
      if (!refundAmount && order.paymentStatus === 'SUCCESS') {
        refundAmount = parseFloat(order.totalAmount.toString());
      }

      // Tạo cancellation record
      const cancellation = await tx.orderCancellation.create({
        data: {
          orderId: id,
          reason: data.reason,
          reasonType: data.reasonType,
          refundAmount: refundAmount ? new Decimal(refundAmount) : null,
          refundMethod: data.refundMethod || null,
          refundStatus: refundAmount ? 'PENDING' : null,
          cancelledBy: userId,
          notes: null,
        },
      });

      // Cập nhật order status
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: order.notes
            ? `${order.notes}\n[CANCELLED] ${data.reason}`
            : `[CANCELLED] ${data.reason}`,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          cancellation: true,
        },
      });

      // Hoàn lại tồn kho nếu đơn đã được xử lý (đã trừ tồn kho)
      if (order.status === 'COMPLETED' || order.status === 'PREPARING' || order.status === 'READY') {
        // Hoàn lại tồn kho cho từng item
        for (const item of order.items) {
          const stock = await tx.stock.findUnique({
            where: { productId: item.productId },
          });

          if (stock) {
            await tx.stock.update({
              where: { productId: item.productId },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });

            // Tạo stock transaction
            await tx.stockTransaction.create({
              data: {
                productId: item.productId,
                type: 'RETURN',
                quantity: item.quantity,
                reason: `Hoàn lại tồn kho do hủy đơn hàng ${order.orderNumber}`,
                userId: userId,
              },
            });
          }
        }
      }

      const transformedOrder = this.transformOrder(updated);
      emitOrderUpdated(transformedOrder);
      emitOrderStatusChanged(transformedOrder.id, transformedOrder.status);

      return transformedOrder;
    });
  }

  /**
   * Return order items (Đổi trả hàng)
   */
  async returnOrder(id: string, data: ReturnOrderInput, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new OrderNotFoundError(id);
      }

      // Chỉ cho phép return đơn đã COMPLETED
      if (order.status !== 'COMPLETED') {
        throw new Error(`Cannot return order with status: ${order.status}`);
      }

      // Validate items
      const totalRefundAmount = data.items.reduce((sum, item) => sum + item.refundAmount, 0);
      
      for (const returnItem of data.items) {
        const orderItem = order.items.find((item) => item.id === returnItem.orderItemId);
        if (!orderItem) {
          throw new Error(`Order item not found: ${returnItem.orderItemId}`);
        }
        if (returnItem.quantity > orderItem.quantity) {
          throw new Error(`Return quantity (${returnItem.quantity}) exceeds order quantity (${orderItem.quantity})`);
        }
      }

      // Tạo return record
      const orderReturn = await tx.orderReturn.create({
        data: {
          orderId: id,
          returnType: data.returnType,
          returnReason: data.returnReason,
          refundAmount: new Decimal(totalRefundAmount),
          refundMethod: data.refundMethod,
          refundStatus: 'PENDING',
          returnedBy: userId,
          notes: data.notes || null,
          items: {
            create: data.items.map((item) => ({
              orderItemId: item.orderItemId,
              quantity: item.quantity,
              refundAmount: new Decimal(item.refundAmount),
            })),
          },
        },
        include: {
          items: {
            include: {
              orderItem: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // Hoàn lại tồn kho
      for (const returnItem of orderReturn.items) {
        const stock = await tx.stock.findUnique({
          where: { productId: returnItem.orderItem.productId },
        });

        if (stock) {
          await tx.stock.update({
            where: { productId: returnItem.orderItem.productId },
            data: {
              quantity: {
                increment: returnItem.quantity,
              },
            },
          });

          await tx.stockTransaction.create({
            data: {
              productId: returnItem.orderItem.productId,
              type: 'RETURN',
              quantity: returnItem.quantity,
              reason: `Hoàn lại tồn kho do đổi trả đơn hàng ${order.orderNumber}`,
              userId: userId,
            },
          });
        }
      }

      // Cập nhật order notes
      await tx.order.update({
        where: { id },
        data: {
          notes: order.notes
            ? `${order.notes}\n[RETURNED] ${data.returnReason} - Hoàn tiền: ${totalRefundAmount.toLocaleString('vi-VN')} VNĐ`
            : `[RETURNED] ${data.returnReason} - Hoàn tiền: ${totalRefundAmount.toLocaleString('vi-VN')} VNĐ`,
        },
      });

      const updatedOrder = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          returns: {
            include: {
              items: true,
            },
          },
        },
      });

      const transformedOrder = this.transformOrder(updatedOrder!);
      emitOrderUpdated(transformedOrder);

      return {
        order: transformedOrder,
        returnRecord: {
          id: orderReturn.id,
          returnType: orderReturn.returnType,
          returnReason: orderReturn.returnReason,
          refundAmount: orderReturn.refundAmount.toString(),
          refundMethod: orderReturn.refundMethod,
          refundStatus: orderReturn.refundStatus,
          items: orderReturn.items.map((item) => ({
            id: item.id,
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            refundAmount: item.refundAmount.toString(),
          })),
        },
      };
    });
  }

  /**
   * Split order (Chia hóa đơn)
   */
  async splitOrder(id: string, data: SplitOrderInput, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const originalOrder = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!originalOrder) {
        throw new OrderNotFoundError(id);
      }

      // Chỉ cho phép split đơn ở trạng thái PENDING hoặc HOLD
      if (originalOrder.status !== 'PENDING' && originalOrder.status !== 'HOLD') {
        throw new Error(`Cannot split order with status: ${originalOrder.status}`);
      }

      // Validate: Tất cả items phải được chia
      const allItemIds = originalOrder.items.map((item) => item.id);
      const splitItemIds = data.splits.flatMap((split) => split.itemIds);
      const missingItems = allItemIds.filter((id) => !splitItemIds.includes(id));
      const duplicateItems = splitItemIds.filter((id, index) => splitItemIds.indexOf(id) !== index);

      if (missingItems.length > 0) {
        throw new Error(`Missing items in split: ${missingItems.join(', ')}`);
      }
      if (duplicateItems.length > 0) {
        throw new Error(`Duplicate items in split: ${duplicateItems.join(', ')}`);
      }

      const splitOrders = [];

      // Tạo các đơn mới từ các phần đã chia
      for (const split of data.splits) {
        const splitItems = originalOrder.items.filter((item) => split.itemIds.includes(item.id));
        const splitTotalAmount = splitItems.reduce((sum, item) => sum + parseFloat(item.subtotal.toString()), 0);

        const orderNumber = this.generateOrderNumber();
        let attempts = 0;
        while (attempts < 10) {
          const existing = await tx.order.findUnique({
            where: { orderNumber },
          });
          if (!existing) break;
          attempts++;
        }

        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            status: 'PENDING',
            totalAmount: new Decimal(splitTotalAmount),
            customerName: originalOrder.customerName,
            customerPhone: originalOrder.customerPhone,
            customerTable: originalOrder.customerTable,
            notes: split.name || `Đơn chia từ ${originalOrder.orderNumber}`,
            orderCreator: originalOrder.orderCreator,
            orderCreatorName: originalOrder.orderCreatorName,
            items: {
              create: splitItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                selectedSize: item.selectedSize,
                selectedToppings: item.selectedToppings,
                note: item.note,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        // Tạo split record
        await tx.orderSplit.create({
          data: {
            originalOrderId: id,
            splitOrderId: newOrder.id,
            splitBy: userId,
          },
        });

        splitOrders.push(this.transformOrder(newOrder));
      }

      // Cập nhật đơn gốc: đánh dấu là đã chia (có thể xóa hoặc giữ lại)
      // Ở đây ta giữ lại đơn gốc với status CANCELLED và notes
      await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: originalOrder.notes
            ? `${originalOrder.notes}\n[SPLIT] Đơn đã được chia thành ${data.splits.length} đơn mới`
            : `[SPLIT] Đơn đã được chia thành ${data.splits.length} đơn mới`,
        },
      });

      // Emit events
      for (const splitOrder of splitOrders) {
        emitOrderCreated(splitOrder);
      }

      const updatedOriginal = await tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      emitOrderUpdated(this.transformOrder(updatedOriginal!));

      return {
        originalOrder: this.transformOrder(updatedOriginal!),
        splitOrders,
      };
    });
  }

  /**
   * Merge orders (Gộp đơn hàng)
   */
  async mergeOrders(data: MergeOrdersInput, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // Validate: Phải có ít nhất 2 đơn
      if (data.orderIds.length < 2) {
        throw new Error('Must merge at least 2 orders');
      }

      // Lấy tất cả đơn cần gộp
      const orders = await tx.order.findMany({
        where: {
          id: {
            in: data.orderIds,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (orders.length !== data.orderIds.length) {
        throw new Error('Some orders not found');
      }

      // Validate: Tất cả đơn phải cùng khách hàng và chưa thanh toán
      const firstOrder = orders[0];
      const customerPhone = firstOrder.customerPhone;
      const customerName = firstOrder.customerName;

      for (const order of orders) {
        if (order.status !== 'PENDING' && order.status !== 'HOLD') {
          throw new Error(`Cannot merge order ${order.orderNumber} with status: ${order.status}`);
        }
        if (order.paymentStatus === 'SUCCESS') {
          throw new Error(`Cannot merge paid order: ${order.orderNumber}`);
        }
        if (order.customerPhone !== customerPhone) {
          throw new Error(`Orders must have same customer phone`);
        }
      }

      // Gộp tất cả items
      const mergedItems: Array<{
        productId: string;
        quantity: number;
        price: Decimal;
        subtotal: Decimal;
        selectedSize?: string | null;
        selectedToppings: string[];
        note?: string | null;
      }> = [];

      for (const order of orders) {
        for (const item of order.items) {
          mergedItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            selectedSize: item.selectedSize,
            selectedToppings: item.selectedToppings,
            note: item.note,
          });
        }
      }

      const mergedTotalAmount = mergedItems.reduce((sum, item) => sum + parseFloat(item.subtotal.toString()), 0);

      // Tạo đơn mới
      const orderNumber = this.generateOrderNumber();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await tx.order.findUnique({
          where: { orderNumber },
        });
        if (!existing) break;
        attempts++;
      }

      const mergedOrder = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          totalAmount: new Decimal(mergedTotalAmount),
          customerName,
          customerPhone,
          customerTable: firstOrder.customerTable,
          notes: data.mergedOrderName || `Đơn gộp từ ${orders.map((o) => o.orderNumber).join(', ')}`,
          orderCreator: firstOrder.orderCreator,
          orderCreatorName: firstOrder.orderCreatorName,
          items: {
            create: mergedItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Tạo merge records và đánh dấu các đơn gốc là CANCELLED
      for (const originalOrder of orders) {
        await tx.orderMerge.create({
          data: {
            mergedOrderId: mergedOrder.id,
            originalOrderId: originalOrder.id,
            mergedBy: userId,
          },
        });

        await tx.order.update({
          where: { id: originalOrder.id },
          data: {
            status: 'CANCELLED',
            notes: originalOrder.notes
              ? `${originalOrder.notes}\n[MERGED] Đã được gộp vào đơn ${mergedOrder.orderNumber}`
              : `[MERGED] Đã được gộp vào đơn ${mergedOrder.orderNumber}`,
          },
        });
      }

      const transformedMergedOrder = this.transformOrder(mergedOrder);
      emitOrderCreated(transformedMergedOrder);

      // Emit updates cho các đơn gốc
      for (const originalOrder of orders) {
        const updated = await tx.order.findUnique({
          where: { id: originalOrder.id },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
        if (updated) {
          emitOrderUpdated(this.transformOrder(updated));
        }
      }

      return {
        mergedOrder: transformedMergedOrder,
        originalOrders: orders.map((o) => this.transformOrder(o)),
      };
    });
  }
}

export default new OrderService();

