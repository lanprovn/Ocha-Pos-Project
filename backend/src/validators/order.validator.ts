/**
 * Order Validators using Zod
 * Centralized validation schemas for order-related inputs
 */

import { z } from 'zod';

// ===== Enums =====
export const OrderStatusEnum = z.enum([
    'CREATING',
    'PENDING',
    'HOLD',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'COMPLETED',
    'CANCELLED',
]);

export const PaymentMethodEnum = z.enum(['CASH', 'QR']);

export const PaymentStatusEnum = z.enum(['PENDING', 'SUCCESS', 'FAILED']);

export const OrderCreatorEnum = z.enum(['STAFF', 'CUSTOMER']);

// ===== Order Item Schema =====
export const createOrderItemSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
    price: z.number().nonnegative('Price cannot be negative'),
    subtotal: z.number().nonnegative('Subtotal cannot be negative'),
    selectedSize: z.string().nullable().optional(),
    selectedToppings: z.array(z.string()).optional().default([]),
    note: z.string().max(500, 'Note too long').nullable().optional(),
});

// ===== Create Order Schema =====
export const createOrderSchema = z.object({
    customerName: z.string().max(100).nullable().optional(),
    customerPhone: z.string().max(20).nullable().optional(),
    customerTable: z.string().max(50).nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
    paymentMethod: PaymentMethodEnum.optional(),
    paymentStatus: PaymentStatusEnum.optional().default('PENDING'),
    orderCreator: OrderCreatorEnum.optional().default('STAFF'),
    orderCreatorName: z.string().max(100).nullable().optional(),
    items: z.array(createOrderItemSchema).min(1, 'Order must have at least one item'),
});

// ===== Update Order Schema =====
export const updateOrderSchema = z.object({
    status: OrderStatusEnum.optional(),
    paymentStatus: PaymentStatusEnum.optional(),
    paymentTransactionId: z.string().optional(),
    paymentDate: z.string().datetime().optional(),
    customerName: z.string().max(100).nullable().optional(),
    customerPhone: z.string().max(20).nullable().optional(),
    customerTable: z.string().max(50).nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
});

// ===== Hold Order Schema =====
export const holdOrderSchema = z.object({
    holdName: z.string().max(100).nullable().optional(),
});

// ===== Cancel Order Schema =====
export const cancelOrderSchema = z.object({
    reason: z.string().min(1, 'Reason is required').max(500),
    reasonType: z.enum(['OUT_OF_STOCK', 'CUSTOMER_REQUEST', 'SYSTEM_ERROR', 'OTHER']),
    refundAmount: z.number().nonnegative().nullable().optional(),
    refundMethod: z.enum(['CASH', 'CARD', 'QR']).nullable().optional(),
});

// ===== Return Order Schema =====
export const returnOrderItemSchema = z.object({
    orderItemId: z.string().uuid('Invalid order item ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
    refundAmount: z.number().nonnegative('Refund amount cannot be negative'),
});

export const returnOrderSchema = z.object({
    returnType: z.enum(['FULL', 'PARTIAL']),
    returnReason: z.enum(['DEFECTIVE', 'WRONG_ITEM', 'CUSTOMER_REQUEST', 'OTHER']),
    refundMethod: z.enum(['CASH', 'CARD', 'QR']),
    items: z.array(returnOrderItemSchema).min(1, 'Must specify items to return'),
    notes: z.string().max(500).nullable().optional(),
});

// ===== Split Order Schema =====
export const splitOrderSchema = z.object({
    splits: z.array(
        z.object({
            name: z.string().max(100).nullable().optional(),
            itemIds: z.array(z.string().uuid()).min(1, 'Each split must have items'),
        })
    ).min(2, 'Must split into at least 2 orders'),
});

// ===== Merge Orders Schema =====
export const mergeOrdersSchema = z.object({
    orderIds: z.array(z.string().uuid()).min(2, 'Must merge at least 2 orders'),
    mergedOrderName: z.string().max(100).nullable().optional(),
});

// ===== Order Filters Schema =====
export const orderFiltersSchema = z.object({
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    paymentMethod: z.string().optional(),
    paymentStatus: z.string().optional(),
    orderCreator: z.string().optional(),
    customerId: z.string().uuid().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ===== Type Exports =====
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type HoldOrderInput = z.infer<typeof holdOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type ReturnOrderInput = z.infer<typeof returnOrderSchema>;
export type SplitOrderInput = z.infer<typeof splitOrderSchema>;
export type MergeOrdersInput = z.infer<typeof mergeOrdersSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
