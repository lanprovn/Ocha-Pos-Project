import apiClient from '@lib/api.service';
import { API_ENDPOINTS } from '@/config/api';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  reportType?: 'daily' | 'weekly' | 'monthly' | 'custom';
}

export interface DailyReportData {
  date: string;
  orderCount: number;
  revenue: number;
  discount: number;
  netRevenue: number;
}

export interface PeakHourData {
  hour: number;
  revenue: number;
  orderCount: number;
}

export interface BestSellerData {
  productId: string;
  productName: string;
  category?: string;
  quantitySold: number;
  revenue: number;
  percentage: number;
}

export interface ReportSummary {
  totalOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  netRevenue: number;
  averageOrderValue: number;
}

export interface PaymentMethodStats {
  [method: string]: {
    count: number;
    revenue: number;
  };
}

export interface ReportData {
  summary: ReportSummary;
  dailyData: DailyReportData[];
  peakHours: PeakHourData[];
  bestSellers: BestSellerData[];
  paymentMethodStats: PaymentMethodStats;
}

type ReportDataResponse = {
  summary: {
    totalOrders: number;
    totalRevenue: string;
    totalDiscount: string;
    netRevenue: string;
    averageOrderValue: string;
  };
  dailyData: Array<{
    date: string;
    orderCount: number;
    revenue: string;
    discount: string;
    netRevenue: string;
  }>;
  peakHours: Array<{
    hour: number;
    revenue: string;
    orderCount: number;
  }>;
  bestSellers: Array<{
    productId: string;
    productName: string;
    category?: string;
    quantitySold: number;
    revenue: string;
    percentage: number;
  }>;
  paymentMethodStats: Record<string, {
    count: number;
    revenue: string;
  }>;
};

const normalizeNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const reportingService = {
  /**
   * Get report data
   */
  async getReport(filters: ReportFilters): Promise<ReportData> {
    const response = (await apiClient.get(API_ENDPOINTS.REPORTING, {
      params: filters,
    })) as ReportDataResponse;

    return {
      summary: {
        totalOrders: response.summary.totalOrders,
        totalRevenue: normalizeNumber(response.summary.totalRevenue),
        totalDiscount: normalizeNumber(response.summary.totalDiscount),
        netRevenue: normalizeNumber(response.summary.netRevenue),
        averageOrderValue: normalizeNumber(response.summary.averageOrderValue),
      },
      dailyData: response.dailyData.map((item) => ({
        date: item.date,
        orderCount: item.orderCount,
        revenue: normalizeNumber(item.revenue),
        discount: normalizeNumber(item.discount),
        netRevenue: normalizeNumber(item.netRevenue),
      })),
      peakHours: response.peakHours.map((item) => ({
        hour: item.hour,
        revenue: normalizeNumber(item.revenue),
        orderCount: item.orderCount,
      })),
      bestSellers: response.bestSellers.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        category: item.category,
        quantitySold: item.quantitySold,
        revenue: normalizeNumber(item.revenue),
        percentage: item.percentage,
      })),
      paymentMethodStats: Object.entries(response.paymentMethodStats).reduce<PaymentMethodStats>(
        (acc, [method, value]) => {
          acc[method] = {
            count: value.count,
            revenue: normalizeNumber(value.revenue),
          };
          return acc;
        },
        {},
      ),
    };
  },

  /**
   * Export report data
   */
  async exportReport(filters: ReportFilters): Promise<Blob> {
    const response = await fetch(
      `${API_ENDPOINTS.REPORTING_EXPORT}?${new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.reportType && { reportType: filters.reportType }),
      })}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to export report');
    }

    return response.blob();
  },
};

export default reportingService;

