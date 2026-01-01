/**
 * Promotion Code related types
 */

import { Timestamped } from './common.types';

// ===== Promotion Type =====
export enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

// ===== Promotion Code (Backend API Response) =====
export interface PromotionCode extends Timestamped {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: PromotionType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate: Date | string;
  endDate: Date | string;
  maxUses?: number | null;
  usedCount: number;
  maxUsesPerCustomer?: number | null;
  isActive: boolean;
}

// ===== Promotion Code Input Types =====
export interface CreatePromotionCodeInput {
  code: string;
  name: string;
  description?: string | null;
  type: PromotionType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate: Date | string;
  endDate: Date | string;
  maxUses?: number | null;
  maxUsesPerCustomer?: number | null;
  isActive?: boolean;
}

export interface UpdatePromotionCodeInput {
  name?: string;
  description?: string | null;
  type?: PromotionType;
  value?: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate?: Date | string;
  endDate?: Date | string;
  maxUses?: number | null;
  maxUsesPerCustomer?: number | null;
  isActive?: boolean;
}

export interface PromotionCodeFilters {
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  code?: string;
  page?: number;
  limit?: number;
}

// ===== Promotion Code Usage =====
export interface PromotionCodeUsage {
  id: string;
  promotionCodeId: string;
  orderId?: string | null;
  customerId?: string | null;
  customerPhone?: string | null;
  discountAmount: number;
  createdAt: Date | string;
}

// ===== Validate Promotion Code Input =====
export interface ValidatePromotionCodeInput {
  code: string;
  orderAmount: number;
  customerId?: string | null;
  customerPhone?: string | null;
}

export interface PromotionCodeValidationResult {
  isValid: boolean;
  discountAmount: number;
  promotionCode?: PromotionCode;
  error?: string;
}



