import prisma from '../config/database';
import { CreateOrderInput, OrderFilters, UpdateOrderStatusInput, UpdateOrderInput, OrderWithItems } from '../types/order.types';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import recipeService from './recipe.service';
import stockService from './stock.service';
import logger from '../utils/logger';
import { InsufficientStockError, OrderNotFoundError } from '../errors';
import { emitStockUpdated } from '../socket/socket.io';
import { StockTransactionType } from '@ocha-pos/shared-types';

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

      return this.transformOrder(updated);
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

      return this.transformOrder(order);
    }
  }

  /**
   * Delete draft orders (CREATING) của cùng orderCreator
   */
  async deleteDraftOrders(orderCreator: 'STAFF' | 'CUSTOMER', orderCreatorName?: string | null) {
    try {
      await prisma.order.deleteMany({
        where: {
          status: 'CREATING',
          orderCreator,
          orderCreatorName: orderCreatorName || null,
        },
      });
    } catch (error) {
      logger.error('Error deleting draft orders', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Không throw error để không block flow
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
                type: 'SALE',
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
        let stock: any;
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

      // 5. Create order with items trong transaction
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          totalAmount: new Decimal(totalAmount),
          customerName: data.customerName || null,
          customerPhone: data.customerPhone || null,
          customerTable: data.customerTable || null,
          notes: data.notes || null,
          paymentMethod: data.paymentMethod || null,
          paymentStatus: data.paymentStatus || 'PENDING',
          orderCreator: data.orderCreator || 'STAFF',
          orderCreatorName: data.orderCreatorName || null,
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

      // ✅ Tất cả operations atomic - hoặc thành công hết hoặc rollback hết
      return this.transformOrder(order);
    });
  }

  /**
   * Get all orders with filters
   */
  async findAll(filters?: OrderFilters) {
    const where: any = {};

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
   * Get today's orders
   * Chỉ load draft orders (CREATING) được tạo trong 1 giờ gần nhất để tránh load draft orders cũ
   */
  async findToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Thời gian 1 giờ trước (để filter draft orders cũ)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        // Chỉ load draft orders (CREATING) được tạo trong 1 giờ gần nhất
        // Các orders khác (PENDING, COMPLETED, etc.) load bình thường
        OR: [
          { status: { not: 'CREATING' } },
          {
            status: 'CREATING',
            createdAt: {
              gte: oneHourAgo,
            },
          },
        ],
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
   * Update order status
   */
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

      // Nếu order chuyển sang COMPLETED:
      // 1. Xóa draft orders của cùng orderCreator trong transaction
      // 2. Tự động trừ nguyên liệu theo recipe trong transaction
      let stockUpdates: Array<{ type: 'product' | 'ingredient'; id: string; productId?: string; ingredientId?: string; quantity: number }> = [];
      
      if (data.status === 'COMPLETED') {
        if (order.orderCreator) {
          await tx.order.deleteMany({
            where: {
              status: 'CREATING',
              orderCreator: order.orderCreator,
              orderCreatorName: order.orderCreatorName,
            },
          });
        }
        
        // Tự động trừ nguyên liệu theo recipe trong transaction
        // Lưu lại thông tin stock updates để emit events sau transaction commit
        stockUpdates = await this.deductIngredientsFromOrder(updated, tx);
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
      
      return order;
    });
  }

  /**
   * Update order (general update)
   */
  async update(id: string, data: UpdateOrderInput) {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const updateData: any = {};
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    if (data.paymentTransactionId !== undefined) updateData.paymentTransactionId = data.paymentTransactionId;
    if (data.paymentDate !== undefined) updateData.paymentDate = data.paymentDate;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await prisma.order.update({
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
}

export default new OrderService();

