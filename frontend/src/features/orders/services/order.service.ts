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
  paymentMethod?: 'CASH' | 'CARD' | 'QR';
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
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
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
};

