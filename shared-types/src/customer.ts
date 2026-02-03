/**
 * Customer related types
 */

import { UUID, Timestamped, PaginationParams } from './common';
import { MembershipLevel, LoyaltyTransactionType } from './enums';

// ===== Customer =====

export interface Customer extends Timestamped {
    id: UUID;
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    dateOfBirth?: Date | string | null;
    gender?: string | null;
    avatar?: string | null;
    loyaltyPoints: number;
    membershipLevel: MembershipLevel;
    totalSpent: number;
    notes?: string | null;
    tags: string[];
    isActive: boolean;
    lastVisitAt?: Date | string | null;
}

// ===== Customer Order (for detail view) =====

export interface CustomerOrder {
    id: UUID;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: Date | string;
}

// ===== Loyalty Transaction =====

export interface LoyaltyTransaction {
    id: UUID;
    customerId: UUID;
    orderId?: UUID | null;
    type: LoyaltyTransactionType;
    points: number;
    reason?: string | null;
    createdAt: Date | string;
}

// ===== Customer Detail (with relations) =====

export interface CustomerDetail extends Customer {
    orders: CustomerOrder[];
    loyaltyTransactions: LoyaltyTransaction[];
}

// ===== Customer Input Types =====

export interface CreateCustomerInput {
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    dateOfBirth?: Date | string | null;
    gender?: string | null;
    notes?: string | null;
    tags?: string[];
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
    isActive?: boolean;
    loyaltyPoints?: number;
    membershipLevel?: MembershipLevel;
}

// ===== Customer Filters =====

export interface CustomerFilters extends PaginationParams {
    search?: string;
    membershipLevel?: MembershipLevel;
    tags?: string[];
    isActive?: boolean;
}

// ===== Customer Statistics =====

export interface CustomerStatisticsCustomer {
    id: UUID;
    name: string;
    phone: string;
    email?: string | null;
    membershipLevel: MembershipLevel;
    loyaltyPoints: number;
    totalSpent: number;
    orderCount: number;
    lastVisitAt?: Date | string | null;
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

// ===== Membership Config =====

export interface MembershipConfig {
    level: MembershipLevel;
    label: string;
    minPoints: number;
    discountRate: number;
    color: string;
}
