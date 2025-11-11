import prisma from '../config/database';

export class ReportsService {
  /**
   * Get revenue summary by period (day, week, month)
   * Returns aggregated revenue data for the specified period
   */
  async getRevenueSummary(period: 'day' | 'week' | 'month', startDate?: string, endDate?: string) {
    let start: Date;
    let end: Date;

    const now = new Date();

    if (startDate && endDate) {
      // Use provided date range
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Calculate based on period
      switch (period) {
        case 'day':
          // Today
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          end = new Date(start);
          end.setDate(end.getDate() + 1);
          end.setMilliseconds(end.getMilliseconds() - 1);
          break;
        case 'week':
          // This week (Monday to Sunday)
          const dayOfWeek = now.getDay();
          const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
          start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
          end = new Date(start);
          end.setDate(end.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case 'month':
          // This month
          start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          end = new Date(start);
          end.setDate(end.getDate() + 1);
          end.setMilliseconds(end.getMilliseconds() - 1);
      }
    }

    // Get orders in the period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        paymentStatus: 'SUCCESS', // Only count paid orders
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount.toString());
    }, 0);

    const totalOrders = orders.length;

    // Group by day for detailed breakdown
    const dailyBreakdown: Record<string, { revenue: number; orders: number; date: string }> = {};
    
    orders.forEach((order) => {
      const orderDate = order.createdAt.toISOString().split('T')[0];
      if (!dailyBreakdown[orderDate]) {
        dailyBreakdown[orderDate] = {
          revenue: 0,
          orders: 0,
          date: orderDate,
        };
      }
      dailyBreakdown[orderDate].revenue += parseFloat(order.totalAmount.toString());
      dailyBreakdown[orderDate].orders += 1;
    });

    const dailyData = Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date));

    // Payment method breakdown
    const paymentBreakdown: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach((order) => {
      const method = order.paymentMethod || 'UNKNOWN';
      if (!paymentBreakdown[method]) {
        paymentBreakdown[method] = { revenue: 0, orders: 0 };
      }
      paymentBreakdown[method].revenue += parseFloat(order.totalAmount.toString());
      paymentBreakdown[method].orders += 1;
    });

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      period,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalRevenue: totalRevenue.toString(),
      totalOrders,
      averageOrderValue: averageOrderValue.toString(),
      dailyBreakdown: dailyData,
      paymentBreakdown,
    };
  }

  /**
   * Export orders to CSV/Excel format
   */
  async exportOrders(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    paymentStatus?: string;
  }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
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
    if (filters?.paymentMethod) where.paymentMethod = filters.paymentMethod;
    if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;

    const orders = await prisma.order.findMany({
      where,
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

    // Transform to export format
    const exportData = orders.map((order) => ({
      orderNumber: order.orderNumber,
      date: order.createdAt.toISOString(),
      status: order.status,
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      customerTable: order.customerTable || '',
      totalAmount: order.totalAmount.toString(),
      paymentMethod: order.paymentMethod || '',
      paymentStatus: order.paymentStatus || '',
      itemsCount: order.items.length,
      items: order.items.map((item: any) => `${item.product.name} x${item.quantity}`).join('; '),
    }));

    return exportData;
  }
}

export default new ReportsService();

