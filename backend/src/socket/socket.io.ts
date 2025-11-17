import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import env from '../config/env';

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
    console.log(`✅ Client connected: ${socket.id}`);

    // Handle room joining
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`📦 Client ${socket.id} joined room: ${room}`);
    });

    // Handle room leaving
    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      console.log(`📤 Client ${socket.id} left room: ${room}`);
    });

    // Subscribe to orders updates
    socket.on('subscribe_orders', () => {
      socket.join('orders');
      console.log(`📋 Client ${socket.id} subscribed to orders`);
    });

    // Subscribe to display updates
    socket.on('subscribe_display', () => {
      socket.join('display');
      console.log(`📺 Client ${socket.id} subscribed to display`);
    });

    // Subscribe to dashboard updates
    socket.on('subscribe_dashboard', () => {
      socket.join('dashboard');
      console.log(`📊 Client ${socket.id} subscribed to dashboard`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  console.log('✅ Socket.io initialized');
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
    io.to('orders').emit('order_created', order);
    io.to('dashboard').emit('dashboard_update', { type: 'order_created', order });
  }
}

/**
 * Emit order updated event
 */
export function emitOrderUpdated(order: any): void {
  if (io) {
    io.to('orders').emit('order_updated', order);
    io.to('dashboard').emit('dashboard_update', { type: 'order_updated', order });
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
 * Emit dashboard update event
 */
export function emitDashboardUpdate(data: any): void {
  if (io) {
    io.to('dashboard').emit('dashboard_update', data);
  }
}

