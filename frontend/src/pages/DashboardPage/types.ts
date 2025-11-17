import type {
  DashboardDailySales as ServiceDashboardDailySales,
  DashboardStats as ServiceDashboardStats,
  DashboardTopProduct,
  DashboardHourlyRevenue,
} from '@services/dashboard.service';

export type DashboardDailySales = ServiceDashboardDailySales;
export type DailySales = DashboardDailySales;
export type OrderSummary = DailySales['orders'][number];
export type TopProduct = DashboardTopProduct;
export type PaymentStats = ServiceDashboardStats['paymentStats'];
export type HourlyRevenue = DashboardHourlyRevenue;
export type DashboardOverview = ServiceDashboardStats['overview'];
export type DashboardStats = ServiceDashboardStats;

