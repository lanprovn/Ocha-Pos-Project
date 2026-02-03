/**
 * Common types used across the application
 */

// ===== Base Interfaces =====

export interface Timestamped {
    createdAt: Date | string;
    updatedAt?: Date | string;
}

export interface CustomerInfo {
    name?: string;
    table?: string;
    phone?: string;
}

// ===== Pagination =====

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

// ===== API Response Types =====

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: ApiError;
    meta?: PaginationMeta;
}

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

// ===== ID Types =====

export type UUID = string;
