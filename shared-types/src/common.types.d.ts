/**
 * Common types and enums shared between Frontend and Backend
 */
export declare enum OrderStatus {
    CREATING = "CREATING",
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    READY = "READY",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    QR = "QR"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
}
export declare enum OrderCreator {
    STAFF = "STAFF",
    CUSTOMER = "CUSTOMER"
}
export declare enum UserRole {
    ADMIN = "ADMIN",
    STAFF = "STAFF",
    CUSTOMER = "CUSTOMER"
}
export declare enum StockTransactionType {
    SALE = "SALE",
    PURCHASE = "PURCHASE",
    ADJUSTMENT = "ADJUSTMENT",
    RETURN = "RETURN"
}
export declare enum StockAlertType {
    LOW_STOCK = "LOW_STOCK",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    OVERSTOCK = "OVERSTOCK"
}
export interface CustomerInfo {
    name?: string;
    table?: string;
    phone?: string;
}
export interface Timestamped {
    createdAt: Date | string;
    updatedAt?: Date | string;
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
export interface ApiError {
    error: string;
    errorCode: string;
    details?: any;
}
//# sourceMappingURL=common.types.d.ts.map