/**
 * API Constants
 * Centralized API-related constants
 */

// ===== API Endpoints =====
export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string | number) => `/products/${id}`,
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string | number) => `/categories/${id}`,
  
  // Orders
  ORDERS: '/orders',
  ORDERS_DRAFT: '/orders/draft',
  ORDER_BY_ID: (id: string | number) => `/orders/${id}`,
  ORDERS_TODAY: '/orders/queries/today',
  ORDERS_BY_DATE: (date: string) => `/orders/queries/date/${date}`,
  ORDERS_HISTORY: '/orders/queries/history',
  UPDATE_ORDER_STATUS: (id: string | number) => `/orders/${id}/status`,
  ORDERS_CANCEL: (id: string | number) => `/orders/${id}/cancel`,
  ORDERS_REFUND: (id: string | number) => `/orders/${id}/refund`,
  ORDERS_RECEIPT: (id: string | number) => `/orders/${id}/receipt`,
  
  // Stock
  STOCK_PRODUCTS: '/stock/products',
  STOCK_PRODUCT_BY_ID: (id: string | number) => `/stock/products/${id}`,
  STOCK_INGREDIENTS: '/stock/ingredients',
  STOCK_TRANSACTIONS: '/stock/transactions',
  STOCK_ALERTS: '/stock/alerts',
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_DAILY_SALES: '/dashboard/daily-sales',
  
  // Reports
  REPORTS_REVENUE: '/reports/revenue',
  REPORTS_ORDERS_EXPORT: '/reports/orders/export',
  
  // Users
  USERS: '/users',
  
  // Health
  HEALTH: '/health',
} as const;

// ===== HTTP Status Codes =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ===== API Error Messages =====
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  TIMEOUT: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định.',
} as const;

// ===== Request Timeout =====
export const REQUEST_TIMEOUT = 10000; // 10 seconds

