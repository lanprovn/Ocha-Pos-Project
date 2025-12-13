/**
 * Order related types
 */

import { Timestamped, OrderStatus, PaymentMethod, PaymentStatus, OrderCreator } from './common.types';
import { Product } from './product.types';

// ===== Order Item =====
export interface OrderItem extends Timestamped {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  selectedSize?: string | null;
  selectedToppings: string[];
  note?: string | null;
  product?: Product | null;
}

// ===== Order (Backend API Response) =====
export interface Order extends Timestamped {
  id: string; // UUID
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  customerName?: string | null;
  customerPhone?: string | null;
  customerTable?: string | null;
  notes?: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string | null;
  orderCreator?: OrderCreator | null;
  orderCreatorName?: string | null;
  paidAt?: Date | string | null;
  paymentDate?: Date | string | null;
  items?: OrderItem[];
}

// ===== Order Input Types =====
export interface CreateOrderItemInput {
  productId: string;
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

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export interface UpdateOrderInput {
  paymentStatus?: PaymentStatus;
  paymentTransactionId?: string;
  paymentDate?: Date | string;
  status?: OrderStatus;
}

export interface OrderFilters {
  status?: OrderStatus | string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod | string;
  paymentStatus?: PaymentStatus | string;
  page?: number;
  limit?: number;
}

// ===== Order with Items (Internal) =====
export interface OrderWithItems {
  id: string;
  orderNumber: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    product?: {
      id: string;
      name: string;
    } | null;
  }>;
}
