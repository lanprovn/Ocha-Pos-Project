/**
 * Stock & Inventory related types
 */

import { UUID, Timestamped, PaginationParams } from './common';
import { StockTransactionType, StockAlertType } from './enums';

// ===== Stock =====

export interface Stock extends Partial<Timestamped> {
    id: UUID;
    productId: UUID;
    quantity: number;
    minStock: number;
    maxStock: number;
    unit: string;
    isActive: boolean;
    lastUpdated: Date | string;
}

// ===== Ingredient =====

export interface Ingredient extends Timestamped {
    id: UUID;
    name: string;
    unit: string;
}

// ===== Ingredient Stock =====

export interface IngredientStock extends Partial<Timestamped> {
    id: UUID;
    ingredientId: UUID;
    quantity: number;
    minStock: number;
    maxStock: number;
    isActive: boolean;
    lastUpdated: Date | string;
}

// ===== Product Recipe =====

export interface ProductRecipe extends Partial<Timestamped> {
    id: UUID;
    productId: UUID;
    ingredientId: UUID;
    quantity: number;
    unit: string;
    ingredient?: Ingredient;
}

// ===== Stock Transaction =====

export interface StockTransaction {
    id: UUID;
    productId?: UUID | null;
    ingredientId?: UUID | null;
    type: StockTransactionType;
    quantity: number;
    reason?: string | null;
    userId?: UUID | null;
    timestamp: Date | string;
}

// ===== Stock Alert =====

export interface StockAlert extends Partial<Timestamped> {
    id: UUID;
    productId?: UUID | null;
    ingredientId?: UUID | null;
    type: StockAlertType;
    message: string;
    isRead: boolean;
    timestamp: Date | string;
}

// ===== Stock Input Types =====

export interface UpdateStockInput {
    quantity?: number;
    minStock?: number;
    maxStock?: number;
    unit?: string;
    isActive?: boolean;
}

export interface StockAdjustmentInput {
    productId?: UUID;
    ingredientId?: UUID;
    type: StockTransactionType;
    quantity: number;
    reason?: string;
}

// ===== Stock Filters =====

export interface StockFilters extends PaginationParams {
    search?: string;
    isActive?: boolean;
    lowStock?: boolean;
    outOfStock?: boolean;
}

export interface StockAlertFilters extends PaginationParams {
    type?: StockAlertType;
    isRead?: boolean;
    productId?: UUID;
    ingredientId?: UUID;
}
