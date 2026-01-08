import apiClient from '@lib/api.service';
import { API_ENDPOINTS } from '@/config/api';
import type {
  Customer,
  CustomerDetail,
  CustomerFilters,
  CustomerListResponse,
  TagsResponse,
  CustomerStatistics,
  MembershipConfig,
  MembershipConfigsResponse,
  DiscountRateResponse,
  MembershipLevel,
} from '@/types/customer';

export const customerService = {
  /**
   * Get all customers with filters and pagination
   */
  async getAll(filters?: CustomerFilters & { page?: number; limit?: number }): Promise<CustomerListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.membershipLevel) params.append('membershipLevel', filters.membershipLevel);
    if (filters?.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.CUSTOMERS}?${queryString}` : API_ENDPOINTS.CUSTOMERS;
    
    return apiClient.get<CustomerListResponse>(url);
  },

  /**
   * Get customer by ID with full details
   */
  async getById(id: string): Promise<CustomerDetail> {
    return apiClient.get<CustomerDetail>(API_ENDPOINTS.CUSTOMER_BY_ID(id));
  },

  /**
   * Get available tags
   */
  async getAvailableTags(): Promise<string[]> {
    const response = await apiClient.get<TagsResponse>(API_ENDPOINTS.CUSTOMERS_TAGS);
    return response.tags;
  },

  /**
   * Update customer information
   */
  async update(id: string, data: {
    name?: string;
    phone?: string;
    email?: string | null;
    address?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    notes?: string | null;
    tags?: string[];
    membershipLevel?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    isActive?: boolean;
  }): Promise<CustomerDetail> {
    return apiClient.put<CustomerDetail>(API_ENDPOINTS.CUSTOMER_BY_ID(id), data);
  },

  /**
   * Adjust loyalty points manually
   */
  async adjustLoyaltyPoints(id: string, points: number, reason: string): Promise<CustomerDetail> {
    return apiClient.post<CustomerDetail>(API_ENDPOINTS.CUSTOMER_ADJUST_POINTS(id), {
      points,
      reason,
    });
  },

  /**
   * Get customer statistics (VIP, frequent customers, etc.)
   */
  async getStatistics(): Promise<CustomerStatistics> {
    return apiClient.get<CustomerStatistics>(API_ENDPOINTS.CUSTOMERS_STATISTICS);
  },

  /**
   * Find customer by phone number
   */
  async findByPhone(phone: string): Promise<{ customer: Customer | null; exists: boolean }> {
    return apiClient.get<{ customer: Customer | null; exists: boolean }>(API_ENDPOINTS.CUSTOMER_BY_PHONE(phone));
  },

  /**
   * Find customer by phone number or create new one
   * Automatically saves customer when phone and name are provided
   */
  async findOrCreateByPhone(
    phone: string,
    name?: string
  ): Promise<{ customer: Customer | null; exists: boolean; created: boolean }> {
    return apiClient.post<{ customer: Customer | null; exists: boolean; created: boolean }>(
      API_ENDPOINTS.CUSTOMER_FIND_OR_CREATE,
      { phone, name }
    );
  },

  /**
   * Get membership levels configuration
   */
  async getMembershipConfigs(): Promise<MembershipConfig[]> {
    const response = await apiClient.get<MembershipConfigsResponse>(API_ENDPOINTS.MEMBERSHIP_CONFIGS);
    return response.configs;
  },

  /**
   * Get discount rate for a membership level
   */
  async getDiscountRate(level: MembershipLevel): Promise<DiscountRateResponse> {
    return apiClient.get<DiscountRateResponse>(API_ENDPOINTS.MEMBERSHIP_DISCOUNT(level));
  },
};

export default customerService;

