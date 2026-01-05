// API Configuration
// Use environment variable or fallback to production backend URL
// In production (Railway), always use Railway backend URL
const getApiBaseUrl = () => {
  // Priority 1: Use env var if explicitly set (for Railway build-time injection)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Priority 2: Auto-detect production by checking hostname (runtime detection)
  // This works even if VITE_API_BASE_URL wasn't set during build
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isProduction = !hostname.includes('localhost') &&
      !hostname.includes('127.0.0.1') &&
      hostname.includes('railway.app');

    if (isProduction) {
      return 'https://ocha-pos-backend-production.up.railway.app/api';
    }
  }

  // Priority 3: Development fallback
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug log to verify API URL (only in development)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌐 Current hostname:', window.location.hostname);
  console.log('📦 VITE_API_BASE_URL env:', import.meta.env.VITE_API_BASE_URL);
}

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
  HEALTH: `${API_BASE_URL.replace('/api', '')}/health`,
};

export default API_BASE_URL;

