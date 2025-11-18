// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/products/${id}`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_BY_ID: (id: string) => `${API_BASE_URL}/categories/${id}`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/orders`,
  ORDERS_DRAFT: `${API_BASE_URL}/orders/draft`,
  ORDER_BY_ID: (id: string) => `${API_BASE_URL}/orders/${id}`,
  ORDERS_TODAY: `${API_BASE_URL}/orders/today`,
  ORDERS_BY_DATE: (date: string) => `${API_BASE_URL}/orders/date/${date}`,
  UPDATE_ORDER_STATUS: (id: string) => `${API_BASE_URL}/orders/${id}/status`,
  
  // Stock
  STOCK_PRODUCTS: `${API_BASE_URL}/stock/products`,
  STOCK_PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/stock/products/${id}`,
  STOCK_INGREDIENTS: `${API_BASE_URL}/stock/ingredients`,
  STOCK_TRANSACTIONS: `${API_BASE_URL}/stock/transactions`,
  STOCK_ALERTS: `${API_BASE_URL}/stock/alerts`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
  DASHBOARD_DAILY_SALES: `${API_BASE_URL}/dashboard/daily-sales`,
  
  // Reporting
  REPORTING: `${API_BASE_URL}/reporting`,
  REPORTING_EXPORT: `${API_BASE_URL}/reporting/export`,
  
  // Health
  HEALTH: 'http://localhost:8080/health',
};

export default API_BASE_URL;

