import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type {
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
  PurchaseOrder,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  ReceivePurchaseOrderInput,
  PurchaseOrderFilters,
} from '../types/supplier';

export const supplierService = {
  /**
   * Get all suppliers
   */
  async getAll(isActive?: boolean): Promise<Supplier[]> {
    const params = new URLSearchParams();
    if (isActive !== undefined) {
      params.append('isActive', String(isActive));
    }
    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.SUPPLIERS}?${queryString}` : API_ENDPOINTS.SUPPLIERS;
    return apiClient.get<Supplier[]>(url);
  },

  /**
   * Get supplier by ID
   */
  async getById(id: string): Promise<Supplier> {
    return apiClient.get<Supplier>(API_ENDPOINTS.SUPPLIER_BY_ID(id));
  },

  /**
   * Create supplier
   */
  async create(data: CreateSupplierInput): Promise<Supplier> {
    return apiClient.post<Supplier>(API_ENDPOINTS.SUPPLIERS, data);
  },

  /**
   * Update supplier
   */
  async update(id: string, data: UpdateSupplierInput): Promise<Supplier> {
    return apiClient.patch<Supplier>(API_ENDPOINTS.SUPPLIER_BY_ID(id), data);
  },

  /**
   * Delete supplier (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.SUPPLIER_BY_ID(id));
  },
};

export const purchaseOrderService = {
  /**
   * Get all purchase orders with optional filters
   */
  async getAll(filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]> {
    const params = new URLSearchParams();
    if (filters?.supplierId) params.append('supplierId', filters.supplierId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.PURCHASE_ORDERS}?${queryString}` : API_ENDPOINTS.PURCHASE_ORDERS;
    return apiClient.get<PurchaseOrder[]>(url);
  },

  /**
   * Get purchase order by ID
   */
  async getById(id: string): Promise<PurchaseOrder> {
    return apiClient.get<PurchaseOrder>(API_ENDPOINTS.PURCHASE_ORDER_BY_ID(id));
  },

  /**
   * Create purchase order
   */
  async create(data: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(API_ENDPOINTS.PURCHASE_ORDERS, data);
  },

  /**
   * Update purchase order
   */
  async update(id: string, data: UpdatePurchaseOrderInput): Promise<PurchaseOrder> {
    return apiClient.patch<PurchaseOrder>(API_ENDPOINTS.PURCHASE_ORDER_BY_ID(id), data);
  },

  /**
   * Receive purchase order
   */
  async receive(id: string, data?: ReceivePurchaseOrderInput): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(API_ENDPOINTS.PURCHASE_ORDER_RECEIVE(id), data || {});
  },

  /**
   * Mark purchase order as paid
   */
  async markAsPaid(id: string): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(API_ENDPOINTS.PURCHASE_ORDER_MARK_PAID(id));
  },

  /**
   * Cancel purchase order
   */
  async cancel(id: string): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(API_ENDPOINTS.PURCHASE_ORDER_CANCEL(id));
  },
};



