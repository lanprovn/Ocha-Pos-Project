import type { MembershipLevel } from '../services/customer.service';

/**
 * Tỷ lệ giảm giá theo hạng thành viên (%)
 */
export const MEMBERSHIP_DISCOUNT_RATES: Record<MembershipLevel, number> = {
  BRONZE: 0,
  SILVER: 2,
  GOLD: 5,
  PLATINUM: 10,
};

/**
 * Tỷ lệ tích điểm theo hạng thành viên
 * Số điểm nhận được trên mỗi 10,000 VND chi tiêu
 */
export const MEMBERSHIP_POINT_RATES: Record<MembershipLevel, number> = {
  BRONZE: 1.0,
  SILVER: 1.2,
  GOLD: 1.5,
  PLATINUM: 2.0,
};

/**
 * Mức chi tiêu để lên hạng (VND)
 */
export const MEMBERSHIP_THRESHOLDS: Record<MembershipLevel, number> = {
  BRONZE: 0,
  SILVER: 500000,
  GOLD: 2000000,
  PLATINUM: 5000000,
};

