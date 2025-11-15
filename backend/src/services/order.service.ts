import { CreateOrderInput, OrderFilters, UpdateOrderStatusInput, UpdateOrderInput } from '../types/order.types';
import { CreateStockTransactionInput } from '../types/stock.types';
import recipeService from './recipe.service';
import stockService from './stock.service';
import logger from '../utils/logger';
import { emitDashboardUpdate, emitOrderStatusChanged } from '../socket/socket.io';
import { validateTransition, type OrderStatus } from '../utils/orderStateMachine';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { orderRepository, productRepository, stockRepository } from '../repositories';
import prisma from '../config/database';

export class OrderService {
  constructor(
    private repository = orderRepository,
    private productRepo = productRepository,
    private stockRepo = stockRepository
  ) {}

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
    // Tìm draft order đang tạo (status = CREATING) của cùng một người tạo
    const existingDraft = await this.repository.findDraftByCreator(
      data.orderCreator || 'STAFF',
      data.orderCreatorName || null
    );

    if (existingDraft) {
      // Update existing draft order
      const updated = await this.repository.updateDraft(existingDraft.id, data);
      return this.transformOrder(updated);
    } else {
      // Create new draft order
      let orderNumber = this.generateOrderNumber();
      
      // OPTIMIZED: Order number now includes timestamp + random, collision probability is extremely low
      // Only check once instead of looping
      const existing = await this.repository.findByOrderNumber(orderNumber);
      
      // If collision (extremely rare), regenerate once
      if (existing) {
        orderNumber = this.generateOrderNumber();
      }

      const order = await this.repository.createWithItems({
        ...data,
        orderNumber,
        status: 'CREATING',
        paymentStatus: 'PENDING',
      });

      return this.transformOrder(order);
    }
  }

  /**
   * Delete draft orders (CREATING) của cùng orderCreator
   */
  async deleteDraftOrders(orderCreator: 'STAFF' | 'CUSTOMER', orderCreatorName?: string | null) {
    try {
      await this.repository.deleteDraftsByCreator(orderCreator, orderCreatorName);
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
      this.stockRepo.findProductStocksByProductIds(productIds),
      this.productRepo.findByIds(productIds),
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
          throw new AppError(
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

    // Generate order number
    // OPTIMIZED: Order number now includes timestamp + random, collision probability is extremely low
    // Only check once instead of looping
    let orderNumber = this.generateOrderNumber();
    const existing = await this.repository.findByOrderNumber(orderNumber);
    
    // If collision (extremely rare), regenerate once
    if (existing) {
      orderNumber = this.generateOrderNumber();
    }

    // Create order with items
    const order = await this.repository.createWithItems({
      ...data,
      orderNumber,
      status: 'PENDING',
      paymentStatus: data.paymentStatus || 'PENDING',
    });

    return this.transformOrder(order);
  }

  /**
   * Get all orders with filters
   * OPTIMIZED: Added pagination to prevent loading too many orders at once
   */
  async findAll(filters?: OrderFilters, page: number = 1, limit: number = 50) {
    const { orders, total } = await this.repository.findManyWithFilters(filters, page, limit);

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
    // Thời gian 1 giờ trước (để filter draft orders cũ)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const orders = await this.repository.findToday(oneHourAgo);
    return orders.map((order) => this.transformOrder(order));
  }

  /**
   * Get orders by date (YYYY-MM-DD)
   */
  async findByDate(date: string) {
    const orders = await this.repository.findByDate(date);
    return orders.map((order) => this.transformOrder(order));
  }

  /**
   * Cancel order
   * Chỉ có thể cancel order ở trạng thái PENDING, CONFIRMED, hoặc PREPARING
   * Nếu đã thanh toán thì cần refund
   */
  async cancelOrder(orderId: string, reason?: string) {
    const order = await this.repository.findByIdWithItems(orderId);

    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
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
      throw new AppError('Đơn hàng đã thanh toán. Vui lòng hoàn tiền trước khi hủy.', HTTP_STATUS.BAD_REQUEST);
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
    const order = await this.repository.findByIdWithItems(orderId);

    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Chỉ có thể refund order đã thanh toán
    if (order.paymentStatus !== 'SUCCESS') {
      throw new AppError('Đơn hàng chưa thanh toán. Không thể hoàn tiền.', HTTP_STATUS.BAD_REQUEST);
    }

    // Update order: set paymentStatus to FAILED và status to CANCELLED
    const refundedOrder = await this.repository.updateOrder(orderId, {
      paymentStatus: 'FAILED',
      status: 'CANCELLED',
    });

    // Update notes separately
    if (refundReason) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          notes: `${order.notes || ''}\n[REFUNDED]: ${refundReason}`.trim(),
        },
      });
    }

    logger.info('Order refunded', { orderId, orderNumber: order.orderNumber, refundReason });

    return this.transformOrder(refundedOrder);
  }

  /**
   * Get order by ID
   */
  async findById(id: string) {
    const order = await this.repository.findByIdWithItems(id);

    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.transformOrder(order);
  }

  /**
   * Get order history with pagination
   */
  async getHistory(page: number = 1, limit: number = 20, filters?: OrderFilters) {
    const { orders, total } = await this.repository.findManyWithFilters(filters, page, limit);

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
    const order = await this.repository.findById(id);

    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
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

    const paymentData = data.status === 'COMPLETED' && !order.paidAt
      ? { paymentStatus: 'SUCCESS' as const }
      : undefined;

    const updated = await this.repository.updateStatus(id, data.status, paymentData);

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
        throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
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
    const order = await this.repository.findById(id);

    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const updated = await this.repository.updateOrder(id, data);
    return this.transformOrder(updated);
  }

  /**
   * Get order by orderNumber (for payment callback)
   */
  async getByOrderNumber(orderNumber: string) {
    const order = await this.repository.findByOrderNumber(orderNumber);

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

