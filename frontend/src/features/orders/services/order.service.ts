import apiClient from '@lib/api.service';
import { API_ENDPOINTS } from '@/config/api';

// Order types based on backend API
export interface CreateOrderItem {
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
  paymentMethod?: 'CASH' | 'QR';
  paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
  orderCreator?: 'STAFF' | 'CUSTOMER';
  orderCreatorName?: string | null;
  items: CreateOrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  subtotal: string;
  selectedSize: string | null;
  selectedToppings: string[];
  note: string | null;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  customerName: string | null;
  customerPhone: string | null;
  customerTable: string | null;
  notes: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  orderCreator: string;
  orderCreatorName: string | null;
  confirmedBy: string | null;
  confirmedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  holdName?: string | null; // For hold orders
}

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface UpdateOrderStatusInput {
  status: 'CREATING' | 'PENDING' | 'HOLD' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
}

export interface HoldOrderInput {
  holdName?: string | null;
}

export interface CancelOrderInput {
  reason: string;
  reasonType: 'OUT_OF_STOCK' | 'CUSTOMER_REQUEST' | 'SYSTEM_ERROR' | 'OTHER';
  refundAmount?: number | null;
  refundMethod?: 'CASH' | 'QR' | null;
}

export interface ReturnOrderItemInput {
  orderItemId: string;
  quantity: number;
  refundAmount: number;
}

export interface ReturnOrderInput {
  returnType: 'FULL' | 'PARTIAL';
  returnReason: 'DEFECTIVE' | 'WRONG_ITEM' | 'CUSTOMER_REQUEST' | 'OTHER';
  refundMethod: 'CASH' | 'QR';
  items: ReturnOrderItemInput[];
  notes?: string | null;
}

export interface SplitOrderInput {
  splits: Array<{
    name?: string | null;
    itemIds: string[];
  }>;
}

export interface MergeOrdersInput {
  orderIds: string[];
  mergedOrderName?: string | null;
}

export const orderService = {
  // Create or update draft order (cart đang tạo)
  async createOrUpdateDraft(data: CreateOrderInput): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS_DRAFT, data);
  },

  // Create new order
  async create(data: CreateOrderInput): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS, data);
  },

  // Get all orders with optional filters
  async getAll(filters?: OrderFilters): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.ORDERS}?${queryString}` : API_ENDPOINTS.ORDERS;
    return apiClient.get<Order[]>(url);
  },

  // Get today's orders
  async getToday(): Promise<Order[]> {
    return apiClient.get<Order[]>(API_ENDPOINTS.ORDERS_TODAY);
  },

  // Get orders by date (YYYY-MM-DD)
  async getByDate(date: string): Promise<Order[]> {
    return apiClient.get<Order[]>(API_ENDPOINTS.ORDERS_BY_DATE(date));
  },

  // Get order by ID
  async getById(id: string): Promise<Order> {
    return apiClient.get<Order>(API_ENDPOINTS.ORDER_BY_ID(id));
  },

  // Update order status
  async updateStatus(id: string, data: UpdateOrderStatusInput): Promise<Order> {
    return apiClient.put<Order>(API_ENDPOINTS.UPDATE_ORDER_STATUS(id), data);
  },

  // Verify order (Staff confirms Customer order)
  async verifyOrder(id: string): Promise<Order> {
    return apiClient.patch<Order>(API_ENDPOINTS.VERIFY_ORDER(id));
  },

  // Reject order (Staff rejects Customer order)
  async rejectOrder(id: string, reason?: string): Promise<Order> {
    return apiClient.patch<Order>(API_ENDPOINTS.REJECT_ORDER(id), { reason });
  },

  // Hold order (Lưu đơn hàng tạm)
  async holdOrder(id: string, data: HoldOrderInput): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.HOLD_ORDER(id), data);
  },

  // Resume hold order (Khôi phục đơn hàng đã lưu)
  async resumeHoldOrder(id: string): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.RESUME_HOLD_ORDER(id));
  },

  // Get hold orders
  async getHoldOrders(orderCreator?: 'STAFF' | 'CUSTOMER'): Promise<Order[]> {
    const params = orderCreator ? `?orderCreator=${orderCreator}` : '';
    return apiClient.get<Order[]>(API_ENDPOINTS.HOLD_ORDERS + params);
  },

  // Cancel order with reason
  async cancelOrder(id: string, data: CancelOrderInput): Promise<Order> {
    return apiClient.post<Order>(API_ENDPOINTS.CANCEL_ORDER(id), data);
  },

  // Return order items
  async returnOrder(id: string, data: ReturnOrderInput): Promise<{ order: Order; returnRecord: any }> {
    return apiClient.post<{ order: Order; returnRecord: any }>(API_ENDPOINTS.RETURN_ORDER(id), data);
  },

  // Split order
  async splitOrder(id: string, data: SplitOrderInput): Promise<{ originalOrder: Order; splitOrders: Order[] }> {
    return apiClient.post<{ originalOrder: Order; splitOrders: Order[] }>(API_ENDPOINTS.SPLIT_ORDER(id), data);
  },

  // Merge orders
  async mergeOrders(data: MergeOrdersInput): Promise<{ mergedOrder: Order; originalOrders: Order[] }> {
    return apiClient.post<{ mergedOrder: Order; originalOrders: Order[] }>(API_ENDPOINTS.MERGE_ORDERS, data);
  },
};

