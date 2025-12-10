/**
 * Stock related types
 */
import { Timestamped } from './common.types';
import { StockTransactionType, StockAlertType } from './common.types';
export interface Stock extends Timestamped {
    id: string;
    productId: string;
    quantity: number;
    minStock: number;
    maxStock: number;
    unit: string;
    isActive: boolean;
    lastUpdated: Date | string;
}
export interface Ingredient extends Timestamped {
    id: string;
    name: string;
    unit: string;
}
export interface IngredientStock extends Timestamped {
    id: string;
    ingredientId: string;
    quantity: number;
    minStock: number;
    maxStock: number;
    isActive: boolean;
    lastUpdated: Date | string;
    ingredient?: Ingredient | null;
}
export interface StockTransaction extends Timestamped {
    id: string;
    productId?: string | null;
    ingredientId?: string | null;
    type: StockTransactionType;
    quantity: number;
    reason?: string | null;
    userId?: string | null;
    timestamp: Date | string;
}
export interface StockAlert extends Timestamped {
    id: string;
    productId?: string | null;
    ingredientId?: string | null;
    type: StockAlertType;
    message: string;
    isRead: boolean;
    timestamp: Date | string;
}
export interface UpdateStockProductInput {
    quantity?: number;
    minStock?: number;
    maxStock?: number;
    unit?: string;
    isActive?: boolean;
}
export interface UpdateStockIngredientInput {
    quantity?: number;
    minStock?: number;
    maxStock?: number;
    isActive?: boolean;
    name?: string;
    unit?: string;
}
export interface CreateStockTransactionInput {
    productId?: string | null;
    ingredientId?: string | null;
    type: StockTransactionType;
    quantity: number;
    reason?: string | null;
    userId?: string | null;
}
export interface CreateStockAlertInput {
    productId?: string | null;
    ingredientId?: string | null;
    type: StockAlertType;
    message: string;
}
export interface UpdateStockAlertInput {
    isRead?: boolean;
    message?: string;
}
export interface StockFilters {
    productId?: string;
    ingredientId?: string;
    isRead?: boolean;
}
export interface CreateProductStockInput {
    productId: string;
    quantity?: number;
    minStock?: number;
    maxStock?: number;
    unit?: string;
    isActive?: boolean;
}
export interface CreateIngredientInput {
    name: string;
    unit: string;
    quantity?: number;
    minStock?: number;
    maxStock?: number;
    isActive?: boolean;
}
export interface UpdateIngredientInput {
    name?: string;
    unit?: string;
    quantity?: number;
    minStock?: number;
    maxStock?: number;
    isActive?: boolean;
}
