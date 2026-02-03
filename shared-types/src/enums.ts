/**
 * @ocha-pos/shared-types
 * Shared TypeScript types for OCHA POS System
 * Used by both Backend and Frontend
 */

// ===== ENUMS =====
// These enums are the single source of truth for status values

export enum OrderStatus {
    CREATING = 'CREATING',
    PENDING = 'PENDING',
    HOLD = 'HOLD',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    QR = 'QR',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export enum OrderCreator {
    STAFF = 'STAFF',
    CUSTOMER = 'CUSTOMER',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    STAFF = 'STAFF',
    CUSTOMER = 'CUSTOMER',
}

export enum MembershipLevel {
    BRONZE = 'BRONZE',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
    PLATINUM = 'PLATINUM',
}

export enum LoyaltyTransactionType {
    EARN = 'EARN',
    REDEEM = 'REDEEM',
    EXPIRED = 'EXPIRED',
    ADJUSTMENT = 'ADJUSTMENT',
}

export enum StockTransactionType {
    SALE = 'SALE',
    PURCHASE = 'PURCHASE',
    ADJUSTMENT = 'ADJUSTMENT',
    RETURN = 'RETURN',
}

export enum StockAlertType {
    LOW_STOCK = 'LOW_STOCK',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
    OVERSTOCK = 'OVERSTOCK',
}
