import prisma from '../config/database';

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats() {
    // OPTIMIZED: Parallelize count queries for better performance
    const [totalProducts, totalIngredients, totalOrders] = await Promise.all([
      prisma.product.count(),
      prisma.ingredient.count(),
      prisma.order.count(),
    ]);

    // Today's stats - Always use current date, no caching
    // Reset to start of today (local time)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        items: true,
      },
    });

    const todayRevenue = todayOrders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount.toString());
    }, 0);

    // OPTIMIZED: Use aggregate query instead of loading all orders
    // This is much faster and uses less memory
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });
    const totalRevenue = parseFloat(totalRevenueResult._sum.totalAmount?.toString() || '0');

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    statusCounts.forEach((item) => {
      ordersByStatus[item.status] = item._count.id;
    });

    // Payment stats
    const paymentStats: Record<string, { count: number; total: string }> = {};
    const paymentGroups = await prisma.order.groupBy({
      by: ['paymentMethod'],
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
      where: {
        paymentMethod: { not: null },
      },
    });

    paymentGroups.forEach((item) => {
      if (item.paymentMethod) {
        paymentStats[item.paymentMethod] = {
          count: item._count.id,
          total: item._sum.totalAmount?.toString() || '0',
        };
      }
    });

    // OPTIMIZED: Top products (by quantity sold) - Fix N+1 queries
    const topProductsData = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        subtotal: true, // Use subtotal sum instead of querying all items
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Batch query all products at once instead of individual queries
    const productIds = topProductsData.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: true,
      },
    });

    // Create map for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    const topProducts = topProductsData.map((item) => {
      const product = productMap.get(item.productId);
      return {
        productId: item.productId,
        productName: product?.name || 'Unknown',
        category: product?.category?.name || '',
        quantitySold: item._sum.quantity || 0,
        revenue: (item._sum.subtotal?.toString() || '0'), // Use aggregated subtotal
      };
    });

    // Hourly revenue (last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: last24Hours,
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const hourlyRevenue: Record<number, { revenue: number; orderCount: number }> = {};
    for (let i = 0; i < 24; i++) {
      hourlyRevenue[i] = { revenue: 0, orderCount: 0 };
    }

    recentOrders.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourlyRevenue[hour].revenue += parseFloat(order.totalAmount.toString());
      hourlyRevenue[hour].orderCount += 1;
    });

    const hourlyRevenueArray = Object.entries(hourlyRevenue).map(([hour, data]) => ({
      hour: parseInt(hour),
      revenue: data.revenue.toString(),
      orderCount: data.orderCount,
    }));

    // OPTIMIZED: Parallelize stock queries
    const [allProductStocks, allIngredientStocks] = await Promise.all([
      prisma.stock.findMany({
        where: {
          isActive: true,
        },
        include: {
          product: true,
        },
      }),
      prisma.ingredientStock.findMany({
        where: {
          isActive: true,
        },
        include: {
          ingredient: true,
        },
      }),
    ]);

    const lowStockProducts = allProductStocks.filter(
      (stock) => stock.quantity <= stock.minStock
    );

    const lowStockIngredients = allIngredientStocks.filter(
      (stock) => stock.quantity <= stock.minStock
    );

    // Recent orders
    const recentOrdersList = await prisma.order.findMany({
      take: 10,
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
      overview: {
        totalProducts,
        totalIngredients,
        totalOrders,
        todayOrders: todayOrders.length,
        todayRevenue: todayRevenue.toString(),
        totalRevenue: totalRevenue.toString(),
        averageOrderValue: averageOrderValue.toString(),
      },
      ordersByStatus,
      paymentStats,
      topProducts,
      hourlyRevenue: hourlyRevenueArray,
      lowStock: {
        products: lowStockProducts.map((stock) => ({
          id: stock.id,
          productId: stock.productId,
          productName: stock.product?.name || 'Unknown',
          quantity: stock.quantity.toString(),
          minStock: stock.minStock.toString(),
        })),
        ingredients: lowStockIngredients.map((stock) => ({
          id: stock.id,
          ingredientId: stock.ingredientId,
          ingredientName: stock.ingredient?.name || 'Unknown',
          quantity: stock.quantity.toString(),
          minStock: stock.minStock.toString(),
        })),
      },
      recentOrders: recentOrdersList.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount.toString(),
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items.length,
        customerName: order.customerName,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        products: order.items.map((item: any) => ({
          name: item.product?.name || 'Unknown',
          quantity: item.quantity,
          price: item.price.toString(),
        })),
      })),
    };
  }

  /**
   * Get daily sales data
   * Always calculates based on the specified date (or today if not provided)
   * No caching - always fresh data
   * Each day is independent - no data carries over from previous days
   */
  async getDailySales(date?: string) {
    let targetDate: Date;
    if (date) {
      // Parse the date string (YYYY-MM-DD) and set to local midnight
      const [year, month, day] = date.split('-').map(Number);
      targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      // Use current local date - start of today
      const now = new Date();
      targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    }
    
    // End of the target date (23:59:59.999)
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setMilliseconds(endDate.getMilliseconds() - 1);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: targetDate,
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

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount.toString());
    }, 0);

    return {
      date: targetDate.toISOString().split('T')[0],
      totalRevenue: totalRevenue.toString(),
      totalOrders: orders.length,
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        timestamp: order.createdAt.getTime(),
        total: parseFloat(order.totalAmount.toString()),
        items: order.items.length,
        customerName: order.customerName || 'Khách hàng',
        paymentMethod: (order.paymentMethod?.toLowerCase() || 'cash') as 'cash' | 'qr',
        products: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: parseFloat(item.price.toString()),
          size: item.selectedSize || null,
          toppings: item.selectedToppings || [],
          note: item.note || null,
        })),
      })),
    };
  }
}

export default new DashboardService();

