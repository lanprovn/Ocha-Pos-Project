/**
 * Socket.io event types for Backend
 */

import { Order } from './order.types';

// ===== Socket.io Event Types =====
export interface ServerToClientEvents {
  order_created: (order: Order) => void;
  order_updated: (order: Order) => void;
  order_status_changed: (data: { orderId: string; status: string }) => void;
  order_verified: (data: { orderId: string; orderNumber: string; confirmedBy: string | null; confirmedAt: string | null }) => void;
  display_update: (data: any) => void;
  stock_alert: (alert: any) => void;
  stock_updated: (data: {
    type: 'product' | 'ingredient';
    productId?: string;
    ingredientId?: string;
    stockId: string;
    oldQuantity: number;
    newQuantity: number;
  }) => void;
  dashboard_update: (data: any) => void;
  user_updated: (data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
    };
    action: 'created' | 'updated' | 'deleted' | 'toggled';
  }) => void;
  customer_discount_updated: (data: {
    phone: string;
    customer: {
      id: string;
      name: string;
      phone: string;
      membershipLevel: string;
      loyaltyPoints: number;
      totalSpent: number;
    };
    discountRate: number;
  }) => void;
  draft_orders_deleted: (data: {
    orderIds: string[];
    orderCreator: 'STAFF' | 'CUSTOMER';
    orderCreatorName: string | null;
  }) => void;
}

export interface ClientToServerEvents {
  join_room: (room: string) => void;
  leave_room: (room: string) => void;
  subscribe_orders: () => void;
  subscribe_display: () => void;
  subscribe_dashboard: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  userRole?: string;
}

