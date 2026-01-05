/**
 * Common types used across the application
 */

// ===== Status Types =====
export type OrderStatus = 'creating' | 'confirmed' | 'paid' | 'preparing' | 'completed';
export type PaymentMethod = 'cash' | 'card' | 'qr';
export type PaymentStatus = 'success' | 'pending' | 'failed';
export type OrderCreatorType = 'staff' | 'customer';

// ===== Common Interfaces =====
export interface CustomerInfo {
  name?: string;
  table?: string;
  phone?: string;
}

export interface Timestamped {
  timestamp: number;
  lastUpdated?: number;
}

