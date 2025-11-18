/**
 * Application Constants
 * Centralized constants for better maintainability
 */

// ===== Storage Keys =====
export const STORAGE_KEYS = {
  CART: 'foodwagon_cart',
  ORDERS: 'orders',
  INGREDIENT_TRANSACTIONS: 'ingredient_transactions',
  INGREDIENT_ALERTS: 'ingredient_alerts',
  DASHBOARD_LAST_DATE: 'dashboard_last_date',
  ORDER_TRACKING: 'ocha_order_tracking_data',
  STOCK_TRANSACTIONS: 'stock_transactions',
  STOCK_ALERTS: 'stock_alerts',
  RECIPES: 'recipes',
} as const;

// ===== Routes =====
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  CUSTOMER: '/customer',
  CHECKOUT: '/checkout',
  DASHBOARD: '/dashboard',
  STOCK_MANAGEMENT: '/stock-management',
  ORDERS: '/orders',
  ORDER_SUCCESS: '/order-success',
  PAYMENT_CALLBACK: '/payment/callback',
  REPORTING: '/reporting',
  PRODUCT_MANAGEMENT: '/product-management', // Deprecated - use MENU_MANAGEMENT
  CATEGORY_MANAGEMENT: '/category-management', // Deprecated - use MENU_MANAGEMENT
  MENU_MANAGEMENT: '/menu-management', // Deprecated - use ADMIN_DASHBOARD
  ANALYTICS: '/analytics',
  ADMIN_DASHBOARD: '/admin',
  PRODUCT: (id: string | number) => `/product/${id}`,
} as const;

// ===== Payment Methods =====
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  QR: 'qr',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// ===== Order Status =====
export const ORDER_STATUS = {
  CREATING: 'creating',
  CONFIRMED: 'confirmed',
  PAID: 'paid',
  COMPLETED: 'completed',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ===== Payment Status =====
export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  PENDING: 'pending',
  FAILED: 'failed',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// ===== Order Creator Types =====
export const ORDER_CREATOR_TYPES = {
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

export type OrderCreatorType = typeof ORDER_CREATOR_TYPES[keyof typeof ORDER_CREATOR_TYPES];

