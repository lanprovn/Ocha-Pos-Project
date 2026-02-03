/**
 * Socket.IO event types for real-time communication
 */

import { Order, OrderItem } from './order';
import { Product } from './product';

// ===== Cart Item for Display =====

export interface DisplayCartItem {
    id: string;
    productId: number | string;
    name: string;
    image: string;
    basePrice: number;
    selectedSize?: {
        name: string;
        extraPrice: number;
    };
    selectedToppings: Array<{
        name: string;
        extraPrice: number;
    }>;
    note?: string;
    quantity: number;
    totalPrice: number;
}

// ===== Display Data =====

export interface DisplayData {
    items: DisplayCartItem[];
    totalPrice: number;
    totalItems: number;
    status: 'creating' | 'confirmed' | 'paid' | 'completed';
    customerInfo?: {
        name?: string;
        table?: string;
        phone?: string;
    };
    timestamp: number;
    paymentMethod?: 'cash' | 'card' | 'qr';
    paymentStatus?: 'success' | 'pending' | 'failed';
    discountRate?: number;
}

// ===== Order Tracking =====

export interface OrderTracking {
    id: string;
    orderId?: string;
    createdBy: 'staff' | 'customer';
    createdByName?: string;
    items: DisplayCartItem[];
    totalPrice: number;
    totalItems: number;
    status: 'creating' | 'pending_verification' | 'confirmed' | 'paid' | 'preparing' | 'completed' | 'hold';
    backendStatus?: string;
    customerInfo?: {
        name?: string;
        table?: string;
        phone?: string;
    };
    paymentMethod?: 'cash' | 'card' | 'qr';
    paymentStatus?: 'success' | 'pending' | 'failed';
    timestamp: number;
    lastUpdated: number;
    paidAt?: number;
}

// ===== Socket Event Types =====

export interface DisplaySyncMessage {
    type: 'cart_update' | 'order_confirmed' | 'order_completed';
    data: DisplayData;
}

export interface OrderTrackingMessage {
    type: 'order_created' | 'order_updated' | 'order_completed' | 'order_removed';
    data: OrderTracking;
}

// ===== Socket Events =====

export interface ServerToClientEvents {
    // Order events
    'order:created': (order: Order) => void;
    'order:updated': (order: Order) => void;
    'order:deleted': (orderId: string) => void;
    'order:statusChanged': (data: { orderId: string; status: string }) => void;

    // Display sync events
    'display:sync': (message: DisplaySyncMessage) => void;
    'display:orderTracking': (message: OrderTrackingMessage) => void;

    // Product events
    'product:updated': (product: Product) => void;
    'product:stockChanged': (data: { productId: string; stock: number }) => void;

    // Stock alerts
    'stock:alert': (alert: { productId: string; type: string; message: string }) => void;
}

export interface ClientToServerEvents {
    // Display sync
    'display:sendToDisplay': (data: DisplayData) => void;
    'display:sendOrderTracking': (data: OrderTracking) => void;

    // Room management
    'join:room': (room: string) => void;
    'leave:room': (room: string) => void;
}
