"use client";
import apiClient from '@lib/api.service';
import { API_ENDPOINTS } from '@/config/api';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'PRODUCT' | 'CATEGORY' | 'ORDER' | 'CUSTOMER' | 'TIME_BASED' | 'UNIVERSAL';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  productIds: string[];
  categoryIds: string[];
  membershipLevels: ('BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM')[];
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  type?: 'PRODUCT' | 'CATEGORY' | 'ORDER' | 'CUSTOMER' | 'TIME_BASED' | 'UNIVERSAL';
  search?: string;
}

export interface PromotionListResponse {
  promotions: Promotion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePromotionInput {
  code: string;
  name: string;
  description?: string;
  type: 'PRODUCT' | 'CATEGORY' | 'ORDER' | 'CUSTOMER' | 'TIME_BASED' | 'UNIVERSAL';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  productIds?: string[];
  categoryIds?: string[];
  membershipLevels?: ('BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM')[];
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}

export interface UpdatePromotionInput {
  code?: string;
  name?: string;
  description?: string;
  type?: 'PRODUCT' | 'CATEGORY' | 'ORDER' | 'CUSTOMER' | 'TIME_BASED' | 'UNIVERSAL';
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  productIds?: string[];
  categoryIds?: string[];
  membershipLevels?: ('BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM')[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}

export interface ValidatePromotionInput {
  code: string;
  orderAmount?: number;
  productIds?: string[];
  categoryIds?: string[];
  customerMembershipLevel?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  customerId?: string;
}

export interface ValidatePromotionResult {
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  promotion?: Promotion;
  error?: string;
}

const promotionService = {
  /**
   * Get all promotions
   */
  async getAll(filters?: PromotionFilters): Promise<PromotionListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.PROMOTIONS}?${queryString}` : API_ENDPOINTS.PROMOTIONS;
    return apiClient.get<PromotionListResponse>(url);
  },

  /**
   * Get promotion by ID
   */
  async getById(id: string): Promise<Promotion> {
    return apiClient.get<Promotion>(API_ENDPOINTS.PROMOTION_BY_ID(id));
  },

  /**
   * Get promotion by code
   */
  async getByCode(code: string): Promise<Promotion | null> {
    try {
      return await apiClient.get<Promotion>(API_ENDPOINTS.PROMOTION_BY_CODE(code));
    } catch {
      return null;
    }
  },

  /**
   * Create promotion
   */
  async create(data: CreatePromotionInput): Promise<Promotion> {
    return apiClient.post<Promotion>(API_ENDPOINTS.PROMOTIONS, data);
  },

  /**
   * Update promotion
   */
  async update(id: string, data: UpdatePromotionInput): Promise<Promotion> {
    return apiClient.put<Promotion>(API_ENDPOINTS.PROMOTION_BY_ID(id), data);
  },

  /**
   * Delete promotion
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.PROMOTION_BY_ID(id));
  },

  /**
   * Validate and apply promotion
   */
  async validateAndApply(input: ValidatePromotionInput): Promise<ValidatePromotionResult> {
    return apiClient.post<ValidatePromotionResult>(API_ENDPOINTS.PROMOTIONS_VALIDATE, input);
  },

  /**
   * Get statistics
   */
  async getStatistics(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.PROMOTIONS_STATISTICS}?${queryString}` : API_ENDPOINTS.PROMOTIONS_STATISTICS;
    return apiClient.get(url);
  },
};

export default promotionService;
