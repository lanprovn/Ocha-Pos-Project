import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

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
  // OPTIMIZED: Now supports pagination, backward compatible with old response format
  async getAll(filters?: OrderFilters, page?: number, limit?: number): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.ORDERS}?${queryString}` : API_ENDPOINTS.ORDERS;
    const response = await apiClient.get<Order[] | { data: Order[]; pagination: any }>(url);
    
    // Handle paginated response (new format) or array response (old format)
    return Array.isArray(response) ? response : response.data;
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

  // Cancel order
  async cancelOrder(id: string, reason?: string): Promise<{ message: string; order: Order }> {
    return apiClient.put<{ message: string; order: Order }>(API_ENDPOINTS.ORDERS_CANCEL(id), { reason });
  },

  // Refund order
  async refundOrder(id: string, refundReason?: string): Promise<{ message: string; order: Order }> {
    return apiClient.post<{ message: string; order: Order }>(API_ENDPOINTS.ORDERS_REFUND(id), { refundReason });
  },

  // Get receipt data
  async getReceipt(id: string): Promise<any> {
    return apiClient.get(API_ENDPOINTS.ORDERS_RECEIPT(id));
  },

  // Export orders to CSV
  async exportOrders(filters?: OrderFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.REPORTS_ORDERS_EXPORT}?${queryString}` : API_ENDPOINTS.REPORTS_ORDERS_EXPORT;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export orders');
    }
    
    return response.blob();
  },

  // Get order history with pagination
  async getHistory(page: number = 1, limit: number = 20, filters?: OrderFilters): Promise<{
    data: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);

    return apiClient.get(`${API_ENDPOINTS.ORDERS_HISTORY}?${params.toString()}`);
  },
};

