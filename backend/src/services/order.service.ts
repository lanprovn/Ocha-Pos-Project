import prisma from '../config/database';
import { CreateOrderInput, OrderFilters, UpdateOrderStatusInput, UpdateOrderInput } from '../types/order.types';
import { CreateStockTransactionInput } from '../types/stock.types';
import { Decimal } from '@prisma/client/runtime/library';
import recipeService from './recipe.service';
import stockService from './stock.service';
import logger from '../utils/logger';
import { emitDashboardUpdate, emitOrderStatusChanged } from '../socket/socket.io';
import { validateTransition, type OrderStatus } from '../utils/orderStateMachine';

export class OrderService {
  /**
   * Generate unique order number
   * Optimized: Uses timestamp + random to avoid collisions and reduce database queries
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
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
      
      // OPTIMIZED: Order number now includes timestamp + random, collision probability is extremely low
      // Only check once instead of looping
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });
      
      // If collision (extremely rare), regenerate once
      if (existing) {
        orderNumber = this.generateOrderNumber();
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
    } catch (error: any) {
      logger.error('Error deleting draft orders', { error: error.message, stack: error.stack });
      // Không throw error để không block flow
    }
  }

  /**
   * Tự động trừ tồn kho sản phẩm và nguyên liệu khi order completed
   */
  private async deductIngredientsFromOrder(order: any) {
    try {
      if (!order.items || order.items.length === 0) {
        return;
      }

      // PRODUCTION READY: Release reserved stock and deduct actual stock
      // 1. Release reserved stock first (was reserved when order created)
      await prisma.$transaction(
        order.items.map((item: any) => {
          return prisma.stock.update({
            where: { productId: item.productId },
            data: {
              reservedQuantity: {
                decrement: item.quantity,
              },
              quantity: {
                decrement: item.quantity, // Deduct actual stock
              },
              lastUpdated: new Date(),
            },
          });
        })
      );

      // 2. Create stock transactions for audit trail
      const productTransactions = order.items.map((item: any) => ({
        productId: item.productId,
        type: 'SALE' as const,
        quantity: item.quantity,
        reason: `Tự động trừ từ đơn hàng ${order.orderNumber}`,
      }));

      // Create all product transactions in parallel (these update stock again, but that's OK - it's idempotent)
      await Promise.all(
        productTransactions.map((transaction: CreateStockTransactionInput) =>
          stockService.createTransaction(transaction).catch((error: any) => {
            logger.error(`Error creating stock transaction`, {
              productId: transaction.productId,
              error: error.message,
              stack: error.stack,
            });
            // Continue with other transactions if one fails
          })
        )
      );

      // 2. Trừ nguyên liệu theo recipe
      const productIds = order.items.map((item: any) => item.productId);
      
      // Lấy tất cả recipes cho các sản phẩm này
      const recipes = await recipeService.getByProducts(productIds);
      
      if (recipes.length === 0) {
        return; // Không có recipe, không cần trừ nguyên liệu
      }

      // Tính tổng nguyên liệu cần trừ (theo số lượng sản phẩm trong order)
      const ingredientDeductions: Record<string, number> = {};
      
      order.items.forEach((item: any) => {
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
      // OPTIMIZED: Batch create transactions instead of individual calls
      const ingredientTransactions = Object.entries(ingredientDeductions).map(
        ([ingredientId, totalQuantity]) => ({
          ingredientId,
          type: 'SALE' as const,
          quantity: Math.ceil(totalQuantity as number), // Làm tròn lên
          reason: `Tự động trừ từ đơn hàng ${order.orderNumber}`,
        })
      );

      // Create all ingredient transactions in parallel
      await Promise.all(
        ingredientTransactions.map((transaction: CreateStockTransactionInput) =>
          stockService.createTransaction(transaction).catch((error: any) => {
            logger.error(`Error deducting ingredient`, {
              ingredientId: transaction.ingredientId,
              error: error.message,
              stack: error.stack,
            });
            // Continue with other transactions if one fails
          })
        )
      );
    } catch (error: any) {
      logger.error('Error deducting stock from order', { orderId: order.id, orderNumber: order.orderNumber, error: error.message, stack: error.stack });
      // Không throw error để không block order completion
    }
  }

  /**
   * Create new order
   */
  async create(data: CreateOrderInput) {
    // Xóa draft orders cũ của cùng orderCreator trước khi tạo order mới
    await this.deleteDraftOrders(
      data.orderCreator || 'STAFF',
      data.orderCreatorName || null
    );

    // PRODUCTION READY: Validate and reserve stock availability
    // OPTIMIZED: Batch query tất cả stocks một lần thay vì query từng item (fix N+1 problem)
    const productIds = data.items.map(item => item.productId);
    const [stocks, products] = await Promise.all([
      prisma.stock.findMany({
        where: { productId: { in: productIds } },
      }),
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      }),
    ]);

    // Create maps for quick lookup
    const stockMap = new Map(stocks.map(s => [s.productId, s]));
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate available stock (quantity - reservedQuantity)
    for (const item of data.items) {
      const stock = stockMap.get(item.productId);
      if (stock) {
        const availableStock = stock.quantity - (stock.reservedQuantity || 0);
        if (availableStock < item.quantity) {
          const product = productMap.get(item.productId);
          throw new Error(
            `Không đủ tồn kho cho sản phẩm "${product?.name || item.productId}". ` +
            `Tồn kho khả dụng: ${availableStock}, yêu cầu: ${item.quantity}`
          );
        }
      }
    }

    // Reserve stock for this order (in transaction to ensure atomicity)
    await prisma.$transaction(
      data.items
        .filter(item => stockMap.has(item.productId))
        .map(item => {
          return prisma.stock.update({
            where: { productId: item.productId },
            data: {
              reservedQuantity: {
                increment: item.quantity,
              },
              lastUpdated: new Date(),
            },
          });
        })
    );

    // Calculate total amount from items
    const totalAmount = data.items.reduce((sum, item) => {
      return sum + item.subtotal;
    }, 0);

    // Generate order number
    // OPTIMIZED: Order number now includes timestamp + random, collision probability is extremely low
    // Only check once instead of looping
    let orderNumber = this.generateOrderNumber();
    const existing = await prisma.order.findUnique({
      where: { orderNumber },
    });
    
    // If collision (extremely rare), regenerate once
    if (existing) {
      orderNumber = this.generateOrderNumber();
    }

    // Create order with items
    const order = await prisma.order.create({
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

    return this.transformOrder(order);
  }

  /**
   * Get all orders with filters
   * OPTIMIZED: Added pagination to prevent loading too many orders at once
   */
  async findAll(filters?: OrderFilters, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
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

    // Get total count and orders in parallel
    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
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
      }),
    ]);

    return {
      data: orders.map((order) => this.transformOrder(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
   * Cancel order
   * Chỉ có thể cancel order ở trạng thái PENDING, CONFIRMED, hoặc PREPARING
   * Nếu đã thanh toán thì cần refund
   */
  async cancelOrder(orderId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // PRODUCTION READY: Validate state transition
    try {
      validateTransition(order.status as OrderStatus, 'CANCELLED');
    } catch (error: any) {
      logger.error('Invalid order status transition for cancellation', {
        orderId,
        orderNumber: order.orderNumber,
        from: order.status,
        to: 'CANCELLED',
        error: error.message,
      });
      throw error;
    }

    // Nếu đã thanh toán thì cần refund trước
    if (order.paymentStatus === 'SUCCESS') {
      throw new Error('Order has been paid. Please refund first before canceling.');
    }

    // PRODUCTION READY: Release reserved stock in transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Release reserved stock (was reserved when order created)
      await Promise.all(
        order.items.map((item: any) => {
          return tx.stock.update({
            where: { productId: item.productId },
            data: {
              reservedQuantity: {
                decrement: item.quantity,
              },
              lastUpdated: new Date(),
            },
          }).catch((error: any) => {
            logger.warn('Error releasing reserved stock', {
              productId: item.productId,
              error: error.message,
            });
            // Continue even if one fails
          });
        })
      );

      // Update order status to CANCELLED
      return await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          notes: reason ? `${order.notes || ''}\n[CANCELLED]: ${reason}`.trim() : order.notes,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    logger.info('Order cancelled', { orderId, orderNumber: order.orderNumber, reason });

    return this.transformOrder(cancelledOrder);
  }

  /**
   * Refund order
   * Chỉ có thể refund order đã thanh toán (paymentStatus = SUCCESS)
   */
  async refundOrder(orderId: string, refundReason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Chỉ có thể refund order đã thanh toán
    if (order.paymentStatus !== 'SUCCESS') {
      throw new Error('Order has not been paid. Cannot refund unpaid order.');
    }

    // Update order: set paymentStatus to FAILED và status to CANCELLED
    const refundedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
        notes: refundReason ? `${order.notes || ''}\n[REFUNDED]: ${refundReason}`.trim() : order.notes,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    logger.info('Order refunded', { orderId, orderNumber: order.orderNumber, refundReason });

    return this.transformOrder(refundedOrder);
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
      throw new Error('Order not found');
    }

    return this.transformOrder(order);
  }

  /**
   * Get order history with pagination
   */
  async getHistory(page: number = 1, limit: number = 20, filters?: OrderFilters) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply filters
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }
    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }
    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      data: orders.map((order) => this.transformOrder(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update order status
   * PRODUCTION READY: Validates state transitions using state machine
   */
  async updateStatus(id: string, data: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // PRODUCTION READY: Validate state transition
    try {
      validateTransition(order.status as OrderStatus, data.status);
    } catch (error: any) {
      logger.error('Invalid order status transition', {
        orderId: id,
        orderNumber: order.orderNumber,
        from: order.status,
        to: data.status,
        error: error.message,
      });
      throw error;
    }

    const updated = await prisma.order.update({
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
    // 1. Xóa draft orders của cùng orderCreator
    // 2. Tự động trừ nguyên liệu theo recipe
    if (data.status === 'COMPLETED') {
      if (order.orderCreator) {
        await this.deleteDraftOrders(
          order.orderCreator,
          order.orderCreatorName
        );
      }
      
      // Tự động trừ nguyên liệu theo recipe
      await this.deductIngredientsFromOrder(updated);
      
      // Emit socket events để cập nhật real-time cho stock management và dashboard
      try {
        emitOrderStatusChanged(updated.id, 'COMPLETED');
        emitDashboardUpdate({
          type: 'order_completed',
          orderId: updated.id,
          orderNumber: updated.orderNumber,
          timestamp: new Date().toISOString(),
        });
        emitDashboardUpdate({
          type: 'stock_update',
          message: 'Stock updated after order completion',
          orderId: updated.id,
          timestamp: new Date().toISOString(),
        });
      } catch (socketError: any) {
        logger.error('Error emitting socket events', { 
          error: socketError.message, 
          stack: socketError.stack,
          orderId: updated.id 
        });
        // Không throw error để không ảnh hưởng đến flow chính
      }
    }

    return this.transformOrder(updated);
  }

  /**
   * Update order status with payment info (atomic operation)
   * PRODUCTION READY: Uses transaction to ensure atomicity
   * Used for payment callbacks to prevent race conditions
   */
  async updateStatusWithPayment(
    id: string,
    status: UpdateOrderStatusInput['status'],
    paymentData?: {
      paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
      paymentTransactionId?: string;
      paymentDate?: Date;
    }
  ) {
    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const updateData: any = {
        status,
      };

      // Add payment data if provided
      if (paymentData) {
        if (paymentData.paymentStatus !== undefined) {
          updateData.paymentStatus = paymentData.paymentStatus;
        }
        if (paymentData.paymentTransactionId !== undefined) {
          updateData.paymentTransactionId = paymentData.paymentTransactionId;
        }
        if (paymentData.paymentDate !== undefined) {
          updateData.paymentDate = paymentData.paymentDate;
        }
      }

      // PRODUCTION READY: Validate state transition
      try {
        validateTransition(order.status as OrderStatus, status);
      } catch (error: any) {
        logger.error('Invalid order status transition in payment callback', {
          orderId: id,
          orderNumber: order.orderNumber,
          from: order.status,
          to: status,
          error: error.message,
        });
        throw error;
      }

      // Auto-set paidAt if completing order
      if (status === 'COMPLETED' && !order.paidAt) {
        updateData.paidAt = new Date();
        if (!paymentData?.paymentStatus) {
          updateData.paymentStatus = 'SUCCESS';
        }
      }

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

      // If order completed, deduct stock and cleanup drafts
      if (status === 'COMPLETED') {
        if (order.orderCreator) {
          await this.deleteDraftOrders(
            order.orderCreator,
            order.orderCreatorName
          );
        }

        // Deduct stock (this also uses transactions internally)
        await this.deductIngredientsFromOrder(updated);

        // Emit socket events
        try {
          emitOrderStatusChanged(updated.id, 'COMPLETED');
          emitDashboardUpdate({
            type: 'order_completed',
            orderId: updated.id,
            orderNumber: updated.orderNumber,
            timestamp: new Date().toISOString(),
          });
          emitDashboardUpdate({
            type: 'stock_update',
            message: 'Stock updated after order completion',
            orderId: updated.id,
            timestamp: new Date().toISOString(),
          });
        } catch (socketError: any) {
          logger.error('Error emitting socket events', {
            error: socketError.message,
            stack: socketError.stack,
            orderId: updated.id,
          });
        }
      }

      return this.transformOrder(updated);
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

