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
  paymentMethod?: 'CASH' | 'CARD' | 'QR';
  paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
  orderCreator?: 'STAFF' | 'CUSTOMER';
  orderCreatorName?: string | null;
  items: CreateOrderItemInput[];
}

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface UpdateOrderStatusInput {
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateOrderInput {
  paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
  paymentTransactionId?: string;
  paymentDate?: Date;
  status?: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
}

/**
 * Order với items - dùng cho internal operations
 */
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

