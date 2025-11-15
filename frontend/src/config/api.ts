// API Configuration
// Support both VITE_API_URL (full URL) and VITE_API_BASE_URL (base path)
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  
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
  ORDERS_TODAY: `${API_BASE_URL}/orders/queries/today`,
  ORDERS_BY_DATE: (date: string) => `${API_BASE_URL}/orders/queries/date/${date}`,
  ORDERS_HISTORY: `${API_BASE_URL}/orders/queries/history`,
  UPDATE_ORDER_STATUS: (id: string) => `${API_BASE_URL}/orders/${id}/status`,
  ORDERS_CANCEL: (id: string) => `${API_BASE_URL}/orders/${id}/cancel`,
  ORDERS_REFUND: (id: string) => `${API_BASE_URL}/orders/${id}/refund`,
  ORDERS_RECEIPT: (id: string) => `${API_BASE_URL}/orders/${id}/receipt`,
  
  // Stock
  STOCK_PRODUCTS: `${API_BASE_URL}/stock/products`,
  STOCK_PRODUCT_BY_ID: (id: string) => `${API_BASE_URL}/stock/products/${id}`,
  STOCK_INGREDIENTS: `${API_BASE_URL}/stock/ingredients`,
  STOCK_TRANSACTIONS: `${API_BASE_URL}/stock/transactions`,
  STOCK_ALERTS: `${API_BASE_URL}/stock/alerts`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
  DASHBOARD_DAILY_SALES: `${API_BASE_URL}/dashboard/daily-sales`,
  
  // Reports
  REPORTS_REVENUE: `${API_BASE_URL}/reports/revenue`,
  REPORTS_ORDERS_EXPORT: `${API_BASE_URL}/reports/orders/export`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  
  // Health
  HEALTH: 'http://localhost:8080/health',
};

export default API_BASE_URL;

