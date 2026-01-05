/**
 * Membership Level Configuration
 * Defines point thresholds and discount rates for each membership level
 */

export type MembershipLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface MembershipConfig {
  level: MembershipLevel;
  label: string;
  minPoints: number; // Minimum points required for this level
  discountRate: number; // Discount percentage (0-100)
  color: string; // Color for UI display
}

export const MEMBERSHIP_CONFIGS: MembershipConfig[] = [
  {
    level: 'BRONZE',
    label: 'Đồng',
    minPoints: 0,
    discountRate: 0, // 0% discount
    color: 'amber',
  },
  {
    level: 'SILVER',
    label: 'Bạc',
    minPoints: 100, // 100 points
    discountRate: 5, // 5% discount
    color: 'gray',
  },
  {
    level: 'GOLD',
    label: 'Vàng',
    minPoints: 500, // 500 points
    discountRate: 10, // 10% discount
    color: 'yellow',
  },
  {
    level: 'PLATINUM',
    label: 'Bạch Kim',
    minPoints: 2000, // 2000 points
    discountRate: 15, // 15% discount
    color: 'purple',
  },
];

/**
 * Calculate membership level based on loyalty points
 */
export function calculateMembershipLevel(points: number): MembershipLevel {
  // Sort by minPoints descending to check from highest to lowest
  const sortedConfigs = [...MEMBERSHIP_CONFIGS].sort((a, b) => b.minPoints - a.minPoints);
  
  for (const config of sortedConfigs) {
    if (points >= config.minPoints) {
      return config.level;
    }
  }
  
  // Default to BRONZE
  return 'BRONZE';
}

/**
 * Get membership config by level
 */
export function getMembershipConfig(level: MembershipLevel): MembershipConfig {
  const config = MEMBERSHIP_CONFIGS.find((c) => c.level === level);
  if (!config) {
    return MEMBERSHIP_CONFIGS[0]; // Default to BRONZE
  }
  return config;
}

/**
 * Get discount rate for a membership level
 */
export function getDiscountRate(level: MembershipLevel): number {
  return getMembershipConfig(level).discountRate;
}

/**
 * Calculate discounted price based on membership level
 */
export function calculateDiscountedPrice(originalPrice: number, level: MembershipLevel): number {
  const discountRate = getDiscountRate(level);
  return originalPrice * (1 - discountRate / 100);
}

