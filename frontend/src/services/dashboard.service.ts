import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface DashboardOverview {
  totalProducts: number;
  totalIngredients: number;
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface DashboardTopProduct {
  productId: string;
  name: string;
  category?: string;
  quantity: number;
  revenue: number;
}

export interface DashboardHourlyRevenue {
  hour: number;
  revenue: number;
  orderCount: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
  customerName: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface DashboardLowStockItem {
  id: string;
  productId?: string;
  productName?: string;
  ingredientId?: string;
  ingredientName?: string;
  quantity: number;
  minStock: number;
}

export interface DashboardStats {
  overview: DashboardOverview;
  ordersByStatus: Record<string, number>;
  paymentStats: Record<string, { count: number; revenue: number }>;
  topProducts: DashboardTopProduct[];
  hourlyRevenue: DashboardHourlyRevenue[];
  lowStock: {
    products: DashboardLowStockItem[];
    ingredients: DashboardLowStockItem[];
  };
  recentOrders: DashboardRecentOrder[];
}

export interface DashboardDailySales {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  orders: Array<{
    id: string;
    orderNumber: string;
    timestamp: number;
    total: number;
    items: number;
    customerName: string;
    paymentMethod: 'cash' | 'card' | 'qr';
    products: Array<{
      name: string;
      quantity: number;
      price: number;
      size: string | null;
      toppings: string[];
      note: string | null;
    }>;
  }>;
}

type DashboardStatsResponse = {
  overview: {
    totalProducts: number;
    totalIngredients: number;
    totalOrders: number;
    todayOrders: number;
    todayRevenue: string;
    totalRevenue: string;
    averageOrderValue: string;
  };
  ordersByStatus: Record<string, number>;
  paymentStats: Record<string, { count: number; total: string }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    category?: string;
    quantitySold: number;
    revenue: string;
  }>;
  hourlyRevenue: Array<{
    hour: number;
    revenue: string;
    orderCount: number;
  }>;
  lowStock: {
    products: Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: string;
      minStock: string;
    }>;
    ingredients: Array<{
      id: string;
      ingredientId: string;
      ingredientName: string;
      quantity: string;
      minStock: string;
    }>;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    createdAt: string;
    itemCount: number;
    customerName: string | null;
    paymentMethod: string | null;
    paymentStatus: string | null;
    products: Array<{
      name: string;
      quantity: number;
      price: string;
    }>;
  }>;
};

type DailySalesResponse = {
  date: string;
  totalRevenue: string;
  totalOrders: number;
  orders: Array<{
    id: string;
    orderNumber: string;
    timestamp: number;
    total: number;
    items: number;
    customerName: string;
    paymentMethod: 'cash' | 'card' | 'qr';
    products: Array<{
      name: string;
      quantity: number;
      price: number;
      size: string | null;
      toppings: string[];
      note: string | null;
    }>;
  }>;
};

const normalizeNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = (await apiClient.get(API_ENDPOINTS.DASHBOARD_STATS)) as DashboardStatsResponse;

    return {
      overview: {
        totalProducts: response.overview.totalProducts,
        totalIngredients: response.overview.totalIngredients,
        totalOrders: response.overview.totalOrders,
        todayOrders: response.overview.todayOrders,
        todayRevenue: normalizeNumber(response.overview.todayRevenue),
        totalRevenue: normalizeNumber(response.overview.totalRevenue),
        averageOrderValue: normalizeNumber(response.overview.averageOrderValue),
      },
      ordersByStatus: response.ordersByStatus,
      paymentStats: Object.entries(response.paymentStats).reduce<Record<string, { count: number; revenue: number }>>(
        (acc, [method, value]) => {
          acc[method.toLowerCase()] = {
            count: value.count,
            revenue: normalizeNumber(value.total),
          };
          return acc;
        },
        {},
      ),
      topProducts: response.topProducts.map((item) => ({
        productId: item.productId,
        name: item.productName,
        category: item.category,
        quantity: item.quantitySold,
        revenue: normalizeNumber(item.revenue),
      })),
      hourlyRevenue: response.hourlyRevenue.map((item) => ({
        hour: item.hour,
        revenue: normalizeNumber(item.revenue),
        orderCount: item.orderCount,
      })),
      lowStock: {
        products: response.lowStock.products.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: normalizeNumber(item.quantity),
          minStock: normalizeNumber(item.minStock),
        })),
        ingredients: response.lowStock.ingredients.map((item) => ({
          id: item.id,
          ingredientId: item.ingredientId,
          ingredientName: item.ingredientName,
          quantity: normalizeNumber(item.quantity),
          minStock: normalizeNumber(item.minStock),
        })),
      },
      recentOrders: response.recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: normalizeNumber(order.totalAmount),
        createdAt: order.createdAt,
        itemCount: order.itemCount,
        customerName: order.customerName,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        products: order.products.map((product) => ({
          name: product.name,
          quantity: product.quantity,
          price: normalizeNumber(product.price),
        })),
      })),
    };
  },

  async getDailySales(date?: string): Promise<DashboardDailySales> {
    const response = (await apiClient.get(API_ENDPOINTS.DASHBOARD_DAILY_SALES, {
      params: date ? { date } : undefined,
    })) as DailySalesResponse;

    return {
      date: response.date,
      totalRevenue: normalizeNumber(response.totalRevenue),
      totalOrders: response.totalOrders,
      orders: response.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        timestamp: order.timestamp,
        total: normalizeNumber(order.total),
        items: order.items,
        customerName: order.customerName,
        paymentMethod: order.paymentMethod,
        products: order.products.map((product) => ({
          name: product.name,
          quantity: product.quantity,
          price: normalizeNumber(product.price),
          size: product.size,
          toppings: product.toppings,
          note: product.note,
        })),
      })),
    };
  },
};

export default dashboardService;

