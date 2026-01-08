import type { CartItem } from './cart';

export interface DisplayData {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  status: 'creating' | 'confirmed' | 'paid' | 'completed';
  customerInfo?: {
    name?: string;
    table?: string;
  };
  timestamp: number;
  paymentMethod?: 'cash' | 'card' | 'qr';
  paymentStatus?: 'success' | 'pending' | 'failed';
}

export interface DisplaySyncMessage {
  type: 'cart_update' | 'order_confirmed' | 'order_completed';
  data: DisplayData;
}

export interface UseDisplaySyncReturn {
  sendToDisplay: (cartItems: CartItem[], totalPrice: number, totalItems: number, status?: DisplayData['status'], customerInfo?: DisplayData['customerInfo'], paymentMethod?: DisplayData['paymentMethod'], paymentStatus?: DisplayData['paymentStatus']) => void;
  subscribeToDisplay: (callback: (data: DisplayData) => void) => () => void;
}

// Order Tracking Types
export interface OrderTracking {
  id: string;
  orderId?: string; // Mã đơn hàng từ hệ thống
  createdBy: 'staff' | 'customer';
  createdByName?: string; // Tên nhân viên hoặc khách hàng
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  status: 'creating' | 'pending_verification' | 'confirmed' | 'paid' | 'preparing' | 'completed' | 'hold'; // Display status (mapped)
  backendStatus?: string; // Backend status gốc (CREATING, PENDING, CONFIRMED, PREPARING, READY, COMPLETED)
  customerInfo?: {
    name?: string;
    table?: string;
    phone?: string;
  };
  paymentMethod?: 'cash' | 'card' | 'qr';
  paymentStatus?: 'success' | 'pending' | 'failed';
  timestamp: number;
  lastUpdated: number;
  paidAt?: number; // Thời gian thanh toán
}

export interface OrderTrackingMessage {
  type: 'order_created' | 'order_updated' | 'order_completed' | 'order_removed';
  data: OrderTracking;
}