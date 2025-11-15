import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import env from '../config/env';
import logger from '../utils/logger';
import { emitWithRetry, startSocketEventRetry } from '../utils/socketEventQueue';

// Socket.io event types
export interface ServerToClientEvents {
  order_created: (order: any) => void;
  order_updated: (order: any) => void;
  order_status_changed: (data: { orderId: string; status: string }) => void;
  display_update: (data: any) => void;
  stock_alert: (alert: any) => void;
  dashboard_update: (data: any) => void;
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
  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Connection handling
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`, { socketId: socket.id });

    // Handle room joining
    socket.on('join_room', (room: string) => {
      socket.join(room);
      logger.debug(`Client joined room`, { socketId: socket.id, room });
    });

    // Handle room leaving
    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      logger.debug(`Client left room`, { socketId: socket.id, room });
    });

    // Subscribe to orders updates
    socket.on('subscribe_orders', () => {
      socket.join('orders');
      logger.debug(`Client subscribed to orders`, { socketId: socket.id });
    });

    // Subscribe to display updates
    socket.on('subscribe_display', () => {
      socket.join('display');
      logger.debug(`Client subscribed to display`, { socketId: socket.id });
    });

    // Subscribe to dashboard updates
    socket.on('subscribe_dashboard', () => {
      socket.join('dashboard');
      logger.debug(`Client subscribed to dashboard`, { socketId: socket.id });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected`, { socketId: socket.id });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error`, { socketId: socket.id, error: error.message, stack: error.stack });
    });
  });

  // PRODUCTION READY: Start socket event retry mechanism
  startSocketEventRetry();

  logger.info('Socket.io initialized successfully');
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
 * PRODUCTION READY: Uses retry mechanism
 */
export function emitOrderCreated(order: any): void {
  if (io) {
    emitWithRetry('order_created', order, 'orders');
    emitWithRetry('dashboard_update', { type: 'order_created', order }, 'dashboard');
  }
}

/**
 * Emit order updated event
 * PRODUCTION READY: Uses retry mechanism
 */
export function emitOrderUpdated(order: any): void {
  if (io) {
    emitWithRetry('order_updated', order, 'orders');
    emitWithRetry('dashboard_update', { type: 'order_updated', order }, 'dashboard');
  }
}

/**
 * Emit order status changed event
 * PRODUCTION READY: Uses retry mechanism
 */
export function emitOrderStatusChanged(orderId: string, status: string): void {
  if (io) {
    const data = { orderId, status };
    emitWithRetry('order_status_changed', data, 'orders');
    emitWithRetry('order_status_changed', data, 'display');
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
 * Emit dashboard update event
 * PRODUCTION READY: Uses retry mechanism
 */
export function emitDashboardUpdate(data: any): void {
  if (io) {
    emitWithRetry('dashboard_update', data, 'dashboard');
  }
}

