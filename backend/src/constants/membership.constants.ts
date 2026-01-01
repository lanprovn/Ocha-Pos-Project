import { MembershipLevel } from '@prisma/client';

/**
 * Tỷ lệ giảm giá theo hạng thành viên (%)
 */
export const MEMBERSHIP_DISCOUNT_RATES: Record<MembershipLevel, number> = {
  BRONZE: 0,      // Không giảm giá
  SILVER: 2,      // Giảm 2%
  GOLD: 5,        // Giảm 5%
  PLATINUM: 10,   // Giảm 10%
};

/**
 * Tỷ lệ tích điểm theo hạng thành viên
 * Số điểm nhận được trên mỗi 10,000 VND chi tiêu
 */
export const MEMBERSHIP_POINT_RATES: Record<MembershipLevel, number> = {
  BRONZE: 1.0,    // 1 điểm / 10,000 VND
  SILVER: 1.2,   // 1.2 điểm / 10,000 VND
  GOLD: 1.5,     // 1.5 điểm / 10,000 VND
  PLATINUM: 2.0, // 2 điểm / 10,000 VND
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

/**
 * Tính số điểm tích lũy dựa trên số tiền và hạng thành viên
 * @param amount - Số tiền chi tiêu (VND)
 * @param membershipLevel - Hạng thành viên
 * @returns Số điểm tích lũy (làm tròn xuống)
 */
export function calculateLoyaltyPoints(amount: number, membershipLevel: MembershipLevel): number {
  const rate = MEMBERSHIP_POINT_RATES[membershipLevel];
  // Làm tròn xuống số điểm
  return Math.floor((amount / 10000) * rate);
}

/**
 * Tính số tiền giảm giá dựa trên tổng tiền và hạng thành viên
 * @param amount - Tổng tiền trước giảm giá (VND)
 * @param membershipLevel - Hạng thành viên
 * @returns Số tiền được giảm (làm tròn xuống)
 */
export function calculateMembershipDiscount(amount: number, membershipLevel: MembershipLevel): number {
  const discountRate = MEMBERSHIP_DISCOUNT_RATES[membershipLevel];
  return Math.floor(amount * (discountRate / 100));
}





