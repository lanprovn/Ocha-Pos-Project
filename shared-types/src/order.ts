/**
 * Order related types
 */

import { UUID, Timestamped, CustomerInfo, PaginationParams } from './common';
import { OrderStatus, PaymentMethod, PaymentStatus, OrderCreator } from './enums';
import { Product } from './product';

// ===== Order Item =====

export interface OrderItem extends Partial<Timestamped> {
    id: UUID;
    orderId: UUID;
    productId: UUID;
    quantity: number;
    price: number;
    subtotal: number;
    selectedSize?: string | null;
    selectedToppings: string[];
    note?: string | null;
    product?: Pick<Product, 'id' | 'name' | 'image'> | null;
}

// ===== Order =====

export interface Order extends Timestamped {
    id: UUID;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    customerName?: string | null;
    customerPhone?: string | null;
    customerTable?: string | null;
    customerId?: UUID | null;
    notes?: string | null;
    holdName?: string | null;
    paymentMethod?: PaymentMethod | null;
    paymentStatus: PaymentStatus;
    paymentTransactionId?: string | null;
    paymentDate?: Date | string | null;
    paidAt?: Date | string | null;
    orderCreator?: OrderCreator | null;
    orderCreatorName?: string | null;
    confirmedBy?: string | null;
    confirmedAt?: Date | string | null;
    items?: OrderItem[];
}

// ===== Order Input Types =====

export interface CreateOrderItemInput {
    productId: UUID;
    quantity: number;
    price: number;
    subtotal: number;
    selectedSize?: string | null;
    selectedToppings?: string[];
    note?: string | null;
}

export interface CreateOrderInput {
    customerName?: string | null;
    customerPhone?: string | null;
    customerTable?: string | null;
    notes?: string | null;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    orderCreator?: OrderCreator;
    orderCreatorName?: string | null;
    items: CreateOrderItemInput[];
}

export interface UpdateOrderInput {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentTransactionId?: string;
    paymentDate?: Date | string;
    customerName?: string | null;
    customerPhone?: string | null;
    customerTable?: string | null;
    notes?: string | null;
}

export interface HoldOrderInput {
    holdName?: string | null;
}

// ===== Order Filters =====

export interface OrderFilters extends PaginationParams {
    status?: OrderStatus | string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: PaymentMethod | string;
    paymentStatus?: PaymentStatus | string;
    orderCreator?: OrderCreator | string;
    customerId?: UUID;
    search?: string;
}

// ===== Advanced Order Management =====

export interface CancelOrderInput {
    reason: string;
    reasonType: 'OUT_OF_STOCK' | 'CUSTOMER_REQUEST' | 'SYSTEM_ERROR' | 'OTHER';
    refundAmount?: number | null;
    refundMethod?: 'CASH' | 'CARD' | 'QR' | null;
}

export interface ReturnOrderItemInput {
    orderItemId: UUID;
    quantity: number;
    refundAmount: number;
}

export interface ReturnOrderInput {
    returnType: 'FULL' | 'PARTIAL';
    returnReason: 'DEFECTIVE' | 'WRONG_ITEM' | 'CUSTOMER_REQUEST' | 'OTHER';
    refundMethod: 'CASH' | 'CARD' | 'QR';
    items: ReturnOrderItemInput[];
    notes?: string | null;
}

export interface SplitOrderInput {
    splits: Array<{
        name?: string | null;
        itemIds: UUID[];
    }>;
}

export interface MergeOrdersInput {
    orderIds: UUID[];
    mergedOrderName?: string | null;
}

// ===== Order Cancellation =====

export interface OrderCancellation {
    id: UUID;
    orderId: UUID;
    reason: string;
    reasonType: string;
    refundAmount?: number | null;
    refundMethod?: string | null;
    refundStatus?: string | null;
    cancelledBy: UUID;
    cancelledAt: Date | string;
    notes?: string | null;
}

// ===== Order Return =====

export interface OrderReturn {
    id: UUID;
    orderId: UUID;
    returnType: string;
    returnReason: string;
    refundAmount: number;
    refundMethod: string;
    refundStatus: string;
    returnedBy: UUID;
    returnedAt: Date | string;
    notes?: string | null;
    items?: OrderReturnItem[];
}

export interface OrderReturnItem {
    id: UUID;
    returnId: UUID;
    orderItemId: UUID;
    quantity: number;
    refundAmount: number;
}
