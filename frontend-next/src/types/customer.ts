export type MembershipLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'EXPIRED' | 'ADJUSTMENT';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  avatar: string | null;
  loyaltyPoints: number;
  membershipLevel: MembershipLevel;
  totalSpent: number;
  notes: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastVisitAt: Date | null;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTransactionType;
  points: number;
  reason: string | null;
  createdAt: Date;
  orderId: string | null;
}

export interface CustomerDetail extends Customer {
  orders: CustomerOrder[];
  loyaltyTransactions: LoyaltyTransaction[];
}

export interface CustomerFilters {
  search?: string;
  membershipLevel?: MembershipLevel;
  tags?: string[];
  isActive?: boolean;
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TagsResponse {
  tags: string[];
}

export interface CustomerStatisticsCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  membershipLevel: MembershipLevel;
  loyaltyPoints: number;
  totalSpent: number;
  orderCount: number;
  lastVisitAt: Date | null;
}

export interface CustomerStatistics {
  overview: {
    totalCustomers: number;
    vipCustomersCount: number;
    frequentCustomersCount: number;
    totalSpent: number;
    totalLoyaltyPoints: number;
    averageSpent: number;
    averageLoyaltyPoints: number;
    averageOrders: number;
  };
  membershipDistribution: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    PLATINUM: number;
  };
  vipCustomers: CustomerStatisticsCustomer[];
  frequentCustomers: CustomerStatisticsCustomer[];
  topCustomersBySpending: CustomerStatisticsCustomer[];
}

export interface MembershipConfig {
  level: MembershipLevel;
  label: string;
  minPoints: number;
  discountRate: number;
  color: string;
}

export interface MembershipConfigsResponse {
  configs: MembershipConfig[];
}

export interface DiscountRateResponse {
  level: MembershipLevel;
  discountRate: number;
  config: MembershipConfig;
}

