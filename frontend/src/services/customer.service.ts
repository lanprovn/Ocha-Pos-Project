import apiClient from './api.service';

export type MembershipLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'EXPIRED' | 'ADJUSTMENT';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  loyaltyPoints: number;
  membershipLevel: MembershipLevel;
  totalSpent: number;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastVisitAt?: string;
  _count?: {
    orders: number;
    loyalty_transactions: number;
  };
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  notes?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface CustomerFilters {
  search?: string;
  membershipLevel?: MembershipLevel;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerStatistics {
  total: number;
  byMembership: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  byStatus: {
    active: number;
    inactive: number;
  };
  totalPoints: number;
}

export interface UpdateLoyaltyPointsInput {
  points: number;
  type: LoyaltyTransactionType;
  reason?: string;
  orderId?: string;
}

export const customerService = {
  /**
   * Get all customers with filters
   */
  async getAll(filters?: CustomerFilters): Promise<CustomersResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.membershipLevel) params.append('membershipLevel', filters.membershipLevel);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString ? `/customers?${queryString}` : '/customers';
    return apiClient.get<CustomersResponse>(url);
  },

  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  /**
   * Get customer by phone
   */
  async getByPhone(phone: string): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/by-phone?phone=${encodeURIComponent(phone)}`);
  },

  /**
   * Create new customer
   */
  async create(data: CreateCustomerInput): Promise<Customer> {
    return apiClient.post<Customer>('/customers', data);
  },

  /**
   * Update customer
   */
  async update(id: string, data: UpdateCustomerInput): Promise<Customer> {
    return apiClient.patch<Customer>(`/customers/${id}`, data);
  },

  /**
   * Delete customer (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/customers/${id}`);
  },

  /**
   * Update customer loyalty points
   */
  async updateLoyaltyPoints(
    id: string,
    data: UpdateLoyaltyPointsInput
  ): Promise<Customer> {
    return apiClient.post<Customer>(`/customers/${id}/loyalty-points`, data);
  },

  /**
   * Get customer statistics
   */
  async getStatistics(): Promise<CustomerStatistics> {
    return apiClient.get<CustomerStatistics>('/customers/statistics');
  },
};

