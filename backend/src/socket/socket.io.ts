import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import env from '../config/env';
import logger from '../utils/logger';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@ocha-pos/shared-types';

let io: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

/**
 * Initialize Socket.io server
 */
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  // Parse FRONTEND_URL - support both single URL and comma-separated URLs
  let allowedOrigins: string | string[] = 'http://localhost:3000';
  if (env.FRONTEND_URL) {
    const urls = env.FRONTEND_URL.split(',').map(url => url.trim()).filter(Boolean);
    allowedOrigins = urls.length === 1 ? urls[0] : urls;
  }

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true, // Allow Engine.IO v3 clients
    path: '/socket.io/',
    allowUpgrades: true, // Allow upgrade from HTTP to WebSocket
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds - check connection every 25s
  });

  // Log Socket.io configuration
  logger.info('Socket.io configuration', {
    allowedOrigins: Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins,
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Connection handling
  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', { socketId: socket.id });

    // Handle room joining
    socket.on('join_room', (room: string) => {
      socket.join(room);
      logger.info('Client joined room', { socketId: socket.id, room });
    });

    // Handle room leaving
    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      logger.info('Client left room', { socketId: socket.id, room });
    });

    // Subscribe to orders updates
    socket.on('subscribe_orders', () => {
      socket.join('orders');
      logger.info('Client subscribed to orders', { socketId: socket.id });
    });

    // Subscribe to display updates
    socket.on('subscribe_display', () => {
      socket.join('display');
      logger.info('Client subscribed to display', { socketId: socket.id });
    });

    // Subscribe to dashboard updates
    socket.on('subscribe_dashboard', () => {
      socket.join('dashboard');
      logger.info('Client subscribed to dashboard', { socketId: socket.id });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

/**
 * Get Socket.io instance
 */
export function getIO(): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocketIO first.');
  }
  return io;
}

/**
 * Emit order created event
 */
export function emitOrderCreated(order: any): void {
  if (io) {
    try {
    io.to('orders').emit('order_created', order);
    io.to('dashboard').emit('dashboard_update', { type: 'order_created', order });
      logger.debug('Emitted order_created event', { orderId: order.id, orderNumber: order.orderNumber });
    } catch (error) {
      logger.error('Failed to emit order_created event', {
        error: error instanceof Error ? error.message : String(error),
        orderId: order.id,
      });
    }
  } else {
    logger.warn('Socket.io not initialized, cannot emit order_created event', { orderId: order.id });
  }
}

/**
 * Emit order updated event
 */
export function emitOrderUpdated(order: any): void {
  if (io) {
    try {
    io.to('orders').emit('order_updated', order);
    io.to('dashboard').emit('dashboard_update', { type: 'order_updated', order });
      logger.debug('Emitted order_updated event', { orderId: order.id, orderNumber: order.orderNumber, status: order.status });
    } catch (error) {
      logger.error('Failed to emit order_updated event', {
        error: error instanceof Error ? error.message : String(error),
        orderId: order.id,
      });
    }
  } else {
    logger.warn('Socket.io not initialized, cannot emit order_updated event', { orderId: order.id });
  }
}

/**
 * Emit order status changed event
 */
export function emitOrderStatusChanged(orderId: string, status: string): void {
  if (io) {
    io.to('orders').emit('order_status_changed', { orderId, status });
    io.to('display').emit('order_status_changed', { orderId, status });
  }
}

/**
 * Emit display update event
 */
export function emitDisplayUpdate(data: any): void {
  if (io) {
    io.to('display').emit('display_update', data);
  }
}

/**
 * Emit stock alert event
 */
export function emitStockAlert(alert: any): void {
  if (io) {
    io.to('dashboard').emit('stock_alert', alert);
  }
}

/**
 * Emit stock updated event
 */
export function emitStockUpdated(data: {
  type: 'product' | 'ingredient';
  productId?: string;
  ingredientId?: string;
  stockId: string;
  oldQuantity: number;
  newQuantity: number;
}): void {
  if (io) {
    io.to('dashboard').emit('stock_updated', data);
    io.to('stock').emit('stock_updated', data);
    const { type: stockType, ...restData } = data;
    io.to('dashboard').emit('dashboard_update', { type: 'stock_update', stockType, ...restData });
  }
}

/**
 * Emit dashboard update event
 */
export function emitDashboardUpdate(data: any): void {
  if (io) {
    io.to('dashboard').emit('dashboard_update', data);
  }
}

