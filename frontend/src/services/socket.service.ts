import { io, Socket } from 'socket.io-client';
import API_BASE_URL from '../config/api';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@ocha-pos/shared-types';

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
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity, // Keep trying to reconnect
        timeout: 20000, // Connection timeout
        path: '/socket.io/',
        upgrade: true,
        rememberUpgrade: false,
      });

      socket.on('connect', () => {
        console.log('✅ Socket.io connected:', socket?.id);
        // Note: Don't auto-subscribe here - let each component subscribe explicitly
        // This prevents duplicate subscriptions and race conditions
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
    if (socketInstance.connected) {
    socketInstance.emit('subscribe_orders');
      console.log('📡 Subscribed to orders room');
    } else {
      console.warn('⚠️ Socket not connected, will subscribe when connected');
    }
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

