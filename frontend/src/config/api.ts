/**
 * API Configuration
 * Centralized API configuration and base URL setup
 */

import { API_ENDPOINTS as ENDPOINTS } from '../constants/api';

// Support both VITE_API_URL (full URL) and VITE_API_BASE_URL (base path)
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

/**
 * Build full API endpoint URL
 */
function buildEndpoint(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/**
 * API Endpoints with full URLs
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: buildEndpoint(ENDPOINTS.AUTH_LOGIN),
  AUTH_ME: buildEndpoint(ENDPOINTS.AUTH_ME),
  
  // Products
  PRODUCTS: buildEndpoint(ENDPOINTS.PRODUCTS),
  PRODUCT_BY_ID: (id: string | number) => buildEndpoint(ENDPOINTS.PRODUCT_BY_ID(String(id))),
  
  // Categories
  CATEGORIES: buildEndpoint(ENDPOINTS.CATEGORIES),
  CATEGORY_BY_ID: (id: string | number) => buildEndpoint(ENDPOINTS.CATEGORY_BY_ID(String(id))),
  
  // Orders
  ORDERS: buildEndpoint(ENDPOINTS.ORDERS),
  ORDERS_DRAFT: buildEndpoint(ENDPOINTS.ORDERS_DRAFT),
  ORDER_BY_ID: (id: string | number) => buildEndpoint(ENDPOINTS.ORDER_BY_ID(String(id))),
  ORDERS_TODAY: buildEndpoint(ENDPOINTS.ORDERS_TODAY),
  ORDERS_BY_DATE: (date: string) => buildEndpoint(ENDPOINTS.ORDERS_BY_DATE(date)),
  ORDERS_HISTORY: buildEndpoint(ENDPOINTS.ORDERS_HISTORY),
  UPDATE_ORDER_STATUS: (id: string | number) => buildEndpoint(ENDPOINTS.UPDATE_ORDER_STATUS(String(id))),
  ORDERS_CANCEL: (id: string | number) => buildEndpoint(ENDPOINTS.ORDERS_CANCEL(String(id))),
  ORDERS_REFUND: (id: string | number) => buildEndpoint(ENDPOINTS.ORDERS_REFUND(String(id))),
  ORDERS_RECEIPT: (id: string | number) => buildEndpoint(ENDPOINTS.ORDERS_RECEIPT(String(id))),
  
  // Stock
  STOCK_PRODUCTS: buildEndpoint(ENDPOINTS.STOCK_PRODUCTS),
  STOCK_PRODUCT_BY_ID: (id: string | number) => buildEndpoint(ENDPOINTS.STOCK_PRODUCT_BY_ID(String(id))),
  STOCK_INGREDIENTS: buildEndpoint(ENDPOINTS.STOCK_INGREDIENTS),
  STOCK_TRANSACTIONS: buildEndpoint(ENDPOINTS.STOCK_TRANSACTIONS),
  STOCK_ALERTS: buildEndpoint(ENDPOINTS.STOCK_ALERTS),
  
  // Dashboard
  DASHBOARD_STATS: buildEndpoint(ENDPOINTS.DASHBOARD_STATS),
  DASHBOARD_DAILY_SALES: buildEndpoint(ENDPOINTS.DASHBOARD_DAILY_SALES),
  
  // Reports
  REPORTS_REVENUE: buildEndpoint(ENDPOINTS.REPORTS_REVENUE),
  REPORTS_ORDERS_EXPORT: buildEndpoint(ENDPOINTS.REPORTS_ORDERS_EXPORT),
  
  // Users
  USERS: buildEndpoint(ENDPOINTS.USERS),
  
  // Health
  HEALTH: `${API_URL.replace('/api', '')}/health`,
};

export default API_BASE_URL;

