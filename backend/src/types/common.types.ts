/**
 * Common types and enums for Backend
 */

// ===== Order Status =====
export enum OrderStatus {
  CREATING = 'CREATING',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ===== Payment Types =====
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  QR = 'QR',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

// ===== Order Creator =====
export enum OrderCreator {
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

// ===== User Role =====
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

// ===== Stock Transaction Types =====
export enum StockTransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

// ===== Stock Alert Types =====
export enum StockAlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  OVERSTOCK = 'OVERSTOCK',
}

// ===== Common Interfaces =====
export interface CustomerInfo {
  name?: string;
  table?: string;
  phone?: string;
}

export interface Timestamped {
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ===== API Response Types =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  error: string;
  errorCode: string;
  details?: any;
}

