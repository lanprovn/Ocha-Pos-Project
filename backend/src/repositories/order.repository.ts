import prisma from '../config/database';
import { BaseRepository } from './base.repository';
import { CreateOrderInput, OrderFilters, UpdateOrderInput } from '../types/order.types';
import { Decimal } from '@prisma/client/runtime/library';

export class OrderRepository extends BaseRepository<any> {
  protected model = prisma.order;

  /**
   * Find draft order by creator
   */
  async findDraftByCreator(orderCreator: 'STAFF' | 'CUSTOMER', orderCreatorName?: string | null) {
    return prisma.order.findFirst({
      where: {
        status: 'CREATING',
        orderCreator,
        orderCreatorName: orderCreatorName || null,
      },
      include: {
        items: true,
      },
    });
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Find order by ID with items
   */
  async findByIdWithItems(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Create order with items
   */
  async createWithItems(data: CreateOrderInput & { orderNumber: string; status: 'CREATING' | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'; paymentStatus: string }) {
    const { items } = data;
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        status: data.status as any,
        totalAmount: new Decimal(totalAmount),
        customerName: data.customerName || null,
        customerPhone: data.customerPhone || null,
        customerTable: data.customerTable || null,
        notes: data.notes || null,
        paymentMethod: data.paymentMethod || null,
        paymentStatus: data.paymentStatus,
        orderCreator: data.orderCreator || 'STAFF',
        orderCreatorName: data.orderCreatorName || null,
        paidAt: data.paymentStatus === 'SUCCESS' ? new Date() : null,
        items: {
          create: items.map((item) => ({
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
  }

  /**
   * Update draft order
   */
  async updateDraft(id: string, data: Partial<CreateOrderInput>) {
    const totalAmount = data.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;

    // Delete old items
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    return prisma.order.update({
      where: { id },
      data: {
        totalAmount: new Decimal(totalAmount),
        customerName: data.customerName || null,
        customerPhone: data.customerPhone || null,
        customerTable: data.customerTable || null,
        notes: data.notes || null,
        items: {
          create: data.items!.map((item) => ({
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
  }

  /**
   * Find orders with filters and pagination
   */
  async findManyWithFilters(filters: OrderFilters | undefined, page: number, limit: number) {
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

    return { orders, total };
  }

  /**
   * Find today's orders
   */
  async findToday(oneHourAgo: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
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
  }

  /**
   * Find orders by date
   */
  async findByDate(date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return prisma.order.findMany({
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
  }

  /**
   * Delete draft orders by creator
   */
  async deleteDraftsByCreator(orderCreator: 'STAFF' | 'CUSTOMER', orderCreatorName?: string | null) {
    return prisma.order.deleteMany({
      where: {
        status: 'CREATING',
        orderCreator,
        orderCreatorName: orderCreatorName || null,
      },
    });
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: string, paymentData?: any) {
    const updateData: any = { status };

    if (paymentData?.paymentStatus !== undefined) {
      updateData.paymentStatus = paymentData.paymentStatus;
    }
    if (paymentData?.paymentTransactionId !== undefined) {
      updateData.paymentTransactionId = paymentData.paymentTransactionId;
    }
    if (paymentData?.paymentDate !== undefined) {
      updateData.paymentDate = paymentData.paymentDate;
    }
    if (status === 'COMPLETED') {
      updateData.paidAt = new Date();
      if (!paymentData?.paymentStatus) {
        updateData.paymentStatus = 'SUCCESS';
      }
    }

    return prisma.order.update({
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
  }

  /**
   * Update order
   */
  async updateOrder(id: string, data: UpdateOrderInput) {
    const updateData: any = {};
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    if (data.paymentTransactionId !== undefined) updateData.paymentTransactionId = data.paymentTransactionId;
    if (data.paymentDate !== undefined) updateData.paymentDate = data.paymentDate;
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.order.update({
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
  }
}

export default new OrderRepository();

