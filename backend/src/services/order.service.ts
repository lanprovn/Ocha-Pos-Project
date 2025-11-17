import prisma from '../config/database';
import { CreateOrderInput, OrderFilters, UpdateOrderStatusInput, UpdateOrderInput } from '../types/order.types';
import { Decimal } from '@prisma/client/runtime/library';
import recipeService from './recipe.service';
import stockService from './stock.service';

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
      console.error('Error deleting draft orders:', error);
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

      // 1. Trừ tồn kho sản phẩm
      for (const item of order.items) {
        try {
          await stockService.createTransaction({
            productId: item.productId,
            type: 'SALE',
            quantity: item.quantity,
            reason: `Tự động trừ từ đơn hàng ${order.orderNumber}`,
          });
        } catch (error) {
          console.error(`Error deducting product stock ${item.productId}:`, error);
          // Tiếp tục với các sản phẩm khác nếu có lỗi
        }
      }

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
      for (const [ingredientId, totalQuantity] of Object.entries(ingredientDeductions)) {
        try {
          await stockService.createTransaction({
            ingredientId,
            type: 'SALE',
            quantity: Math.ceil(totalQuantity), // Làm tròn lên
            reason: `Tự động trừ từ đơn hàng ${order.orderNumber}`,
          });
        } catch (error) {
          console.error(`Error deducting ingredient ${ingredientId}:`, error);
          // Tiếp tục với các nguyên liệu khác nếu có lỗi
        }
      }
    } catch (error) {
      console.error('Error deducting stock from order:', error);
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

    // Validate stock availability trước khi tạo order
    for (const item of data.items) {
      const stock = await prisma.stock.findUnique({
        where: { productId: item.productId },
      });

      if (stock) {
        if (stock.quantity < item.quantity) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          throw new Error(
            `Không đủ tồn kho cho sản phẩm "${product?.name || item.productId}". Tồn kho hiện tại: ${stock.quantity}, yêu cầu: ${item.quantity}`
          );
        }
      }
    }

    // Calculate total amount from items
    const totalAmount = data.items.reduce((sum, item) => {
      return sum + item.subtotal;
    }, 0);

    // Generate order number
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
      throw new Error('Order not found');
    }

    return this.transformOrder(order);
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, data: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error('Order not found');
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
    }

    return this.transformOrder(updated);
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

