import { io, Socket } from 'socket.io-client';
import API_BASE_URL from '../config/api';

// Socket.io event types
export interface ServerToClientEvents {
  order_created: (order: any) => void;
  order_updated: (order: any) => void;
  order_status_changed: (data: { orderId: string; status: string }) => void;
  display_update: (data: any) => void;
  stock_alert: (alert: any) => void;
  stock_updated: (data: { type: 'product' | 'ingredient'; productId?: string; ingredientId?: string; stockId: string; oldQuantity: number; newQuantity: number }) => void;
  dashboard_update: (data: any) => void;
}

export interface ClientToServerEvents {
  join_room: (room: string) => void;
  leave_room: (room: string) => void;
  subscribe_orders: () => void;
  subscribe_display: () => void;
  subscribe_dashboard: () => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

/**
 * Get or create Socket.io connection
 */
export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  if (!socket) {
    try {
      // Extract base URL from API_BASE_URL (remove /api)
      const baseURL = API_BASE_URL.replace('/api', '');
      
      socket = io(baseURL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('✅ Socket.io connected:', socket?.id);
        // Auto join orders room khi connect
        if (socket) {
          socket.emit('subscribe_orders');
        }
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket.io disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket.io connection error:', error);
      });
    } catch (error) {
      console.error('❌ Failed to initialize Socket.io:', error);
      return null;
    }
  }
  return socket;
}

/**
 * Subscribe to orders updates
 */
export function subscribeToOrders(
  onOrderCreated?: (order: any) => void,
  onOrderUpdated?: (order: any) => void,
  onOrderStatusChanged?: (data: { orderId: string; status: string }) => void
): () => void {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.warn('Socket.io not available, using fallback');
    return () => {};
  }

  // Helper function to subscribe to orders room
  const subscribeToOrdersRoom = () => {
    socketInstance.emit('subscribe_orders');
  };

  // Ensure socket is connected before subscribing
  if (socketInstance.connected) {
    // Socket already connected, subscribe immediately
    subscribeToOrdersRoom();
  } else {
    // Socket not connected yet, wait for connection
    socketInstance.once('connect', () => {
      subscribeToOrdersRoom();
    });
    // Socket will subscribe on connect event
  }

  // Register event listeners
  if (onOrderCreated) {
    socketInstance.on('order_created', onOrderCreated);
  }
  if (onOrderUpdated) {
    socketInstance.on('order_updated', onOrderUpdated);
  }
  if (onOrderStatusChanged) {
    socketInstance.on('order_status_changed', onOrderStatusChanged);
  }

  // Return cleanup function
  return () => {
    if (onOrderCreated) {
      socketInstance.off('order_created', onOrderCreated);
    }
    if (onOrderUpdated) {
      socketInstance.off('order_updated', onOrderUpdated);
    }
    if (onOrderStatusChanged) {
      socketInstance.off('order_status_changed', onOrderStatusChanged);
    }
  };
}

/**
 * Subscribe to display updates
 */
export function subscribeToDisplay(onDisplayUpdate?: (data: any) => void): () => void {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.warn('Socket.io not available, using fallback');
    return () => {};
  }

  socketInstance.emit('subscribe_display');

  if (onDisplayUpdate) {
    socketInstance.on('display_update', onDisplayUpdate);
  }

  // Return cleanup function
  return () => {
    if (onDisplayUpdate) {
      socketInstance.off('display_update', onDisplayUpdate);
    }
  };
}

/**
 * Subscribe to dashboard updates
 */
export function subscribeToDashboard(
  onDashboardUpdate?: (data: any) => void,
  onStockAlert?: (alert: any) => void,
  onStockUpdated?: (data: { type: 'product' | 'ingredient'; productId?: string; ingredientId?: string; stockId: string; oldQuantity: number; newQuantity: number }) => void
): () => void {
  const socketInstance = getSocket();
  if (!socketInstance) {
    console.warn('Socket.io not available, using fallback');
    return () => {};
  }

  socketInstance.emit('subscribe_dashboard');

  if (onDashboardUpdate) {
    socketInstance.on('dashboard_update', onDashboardUpdate);
  }
  if (onStockAlert) {
    socketInstance.on('stock_alert', onStockAlert);
  }
  if (onStockUpdated) {
    socketInstance.on('stock_updated', onStockUpdated);
  }

  // Return cleanup function
  return () => {
    if (onDashboardUpdate) {
      socketInstance.off('dashboard_update', onDashboardUpdate);
    }
    if (onStockAlert) {
      socketInstance.off('stock_alert', onStockAlert);
    }
    if (onStockUpdated) {
      socketInstance.off('stock_updated', onStockUpdated);
    }
  };
}

/**
 * Disconnect Socket.io
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if Socket.io is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected || false;
}

