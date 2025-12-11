/**
 * Socket.io event types for Frontend
 */

// ===== Socket.io Event Types =====
export interface ServerToClientEvents {
  order_created: (order: any) => void;
  order_updated: (order: any) => void;
  order_status_changed: (data: { orderId: string; status: string }) => void;
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
}

export interface ClientToServerEvents {
  join_room: (room: string) => void;
  leave_room: (room: string) => void;
  subscribe_orders: () => void;
  subscribe_display: () => void;
  subscribe_dashboard: () => void;
}

