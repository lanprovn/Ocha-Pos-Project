import type { MembershipLevel } from '../services/customer.service';

interface MembershipBadgeProps {
  level: MembershipLevel;
  discount?: number;
  className?: string;
}

const MEMBERSHIP_COLORS: Record<MembershipLevel, string> = {
  BRONZE: 'bg-amber-100 text-amber-800 border-amber-300',
  SILVER: 'bg-gray-100 text-gray-800 border-gray-300',
  GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PLATINUM: 'bg-purple-100 text-purple-800 border-purple-300',
};

const MEMBERSHIP_LABELS: Record<MembershipLevel, string> = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  PLATINUM: 'Bạch Kim',
};

export function MembershipBadge({ level, discount, className = '' }: MembershipBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${MEMBERSHIP_COLORS[level]} ${className}`}>
      <span>{MEMBERSHIP_LABELS[level]}</span>
      {discount !== undefined && discount > 0 && (
        <span className="text-xs">(-{discount}%)</span>
      )}
    </div>
  );
}

