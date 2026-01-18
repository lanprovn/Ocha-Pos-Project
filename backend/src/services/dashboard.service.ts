import prisma from '@config/database';

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats() {
    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Hourly revenue date range
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    // ✅ OPTIMIZED: Parallelize independent DB queries
    const [
      totalProducts,
      totalIngredients,
      totalOrders,
      todayOrders,
      allOrders,
      statusCounts,
      paymentGroups,
      topProductsData,
      recentOrdersForHourly,
      allProductStocks,
      allIngredientStocks,
      recentOrdersList,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.ingredient.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          items: true,
        },
      }),
      prisma.order.findMany({
        select: {
          totalAmount: true,
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
      prisma.order.groupBy({
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
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
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
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: last24Hours,
          },
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      }),
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
      prisma.order.findMany({
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
      }),
    ]);

    // Process today revenue
    const todayRevenue = todayOrders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount.toString());
    }, 0);

    // Process total revenue
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount.toString());
    }, 0);

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Process orders by status
    const ordersByStatus: Record<string, number> = {};
    statusCounts.forEach((item) => {
      ordersByStatus[item.status] = item._count.id;
    });

    // Process payment stats
    const paymentStats: Record<string, { count: number; total: string }> = {};
    paymentGroups.forEach((item) => {
      if (item.paymentMethod) {
        paymentStats[item.paymentMethod] = {
          count: item._count.id,
          total: item._sum.totalAmount?.toString() || '0',
        };
      }
    });

    // ✅ OPTIMIZED: Process top products in parallel
    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const [product, productOrders] = await Promise.all([
          prisma.product.findUnique({
            where: { id: item.productId },
            include: {
              category: true,
            },
          }),
          prisma.orderItem.findMany({
            where: { productId: item.productId },
            select: {
              subtotal: true,
            },
          }),
        ]);

        const revenue = productOrders.reduce((sum, order) => {
          return sum + parseFloat(order.subtotal.toString());
        }, 0);

        return {
          productId: item.productId,
          productName: product?.name || 'Unknown',
          category: product?.category?.name || '',
          quantitySold: item._sum.quantity || 0,
          revenue: revenue.toString(),
        };
      })
    );

    // Process hourly revenue (last 24 hours)
    const hourlyRevenue: Record<number, { revenue: number; orderCount: number }> = {};
    for (let i = 0; i < 24; i++) {
      hourlyRevenue[i] = { revenue: 0, orderCount: 0 };
    }

    recentOrdersForHourly.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourlyRevenue[hour].revenue += parseFloat(order.totalAmount.toString());
      hourlyRevenue[hour].orderCount += 1;
    });

    const hourlyRevenueArray = Object.entries(hourlyRevenue).map(([hour, data]) => ({
      hour: parseInt(hour),
      revenue: data.revenue.toString(),
      orderCount: data.orderCount,
    }));

    // Process low stock alerts
    const lowStockProducts = allProductStocks.filter(
      (stock) => stock.quantity <= stock.minStock
    );

    const lowStockIngredients = allIngredientStocks.filter(
      (stock) => stock.quantity <= stock.minStock
    );

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
   */
  async getDailySales(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

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

