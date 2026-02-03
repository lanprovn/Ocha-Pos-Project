/**
 * Stock Validators using Zod
 * Centralized validation schemas for stock/inventory-related inputs
 */

import { z } from 'zod';

// ===== Enums =====
export const StockTransactionTypeEnum = z.enum(['SALE', 'PURCHASE', 'ADJUSTMENT', 'RETURN']);

export const StockAlertTypeEnum = z.enum(['LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK']);

// ===== Update Stock Schema =====
export const updateStockSchema = z.object({
    quantity: z.number().int().nonnegative('Quantity cannot be negative').optional(),
    minStock: z.number().int().nonnegative('Min stock cannot be negative').optional(),
    maxStock: z.number().int().nonnegative('Max stock cannot be negative').optional(),
    unit: z.string().max(20).optional(),
    isActive: z.boolean().optional(),
});

// ===== Stock Adjustment Schema =====
export const stockAdjustmentSchema = z.object({
    productId: z.string().uuid('Invalid product ID').optional(),
    ingredientId: z.string().uuid('Invalid ingredient ID').optional(),
    type: StockTransactionTypeEnum,
    quantity: z.number().int('Quantity must be an integer'),
    reason: z.string().max(500).optional(),
}).refine(
    (data) => data.productId || data.ingredientId,
    { message: 'Either productId or ingredientId is required' }
);

// ===== Create Ingredient Schema =====
export const createIngredientSchema = z.object({
    name: z.string().min(1, 'Ingredient name is required').max(100),
    unit: z.string().min(1, 'Unit is required').max(20),
});

export const updateIngredientSchema = createIngredientSchema.partial();

// ===== Product Recipe Schema =====
export const createRecipeSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    ingredientId: z.string().uuid('Invalid ingredient ID'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1).max(20),
});

export const updateRecipeSchema = z.object({
    quantity: z.number().positive('Quantity must be positive').optional(),
    unit: z.string().min(1).max(20).optional(),
});

// ===== Stock Filters Schema =====
export const stockFiltersSchema = z.object({
    search: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
    lowStock: z.coerce.boolean().optional(),
    outOfStock: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ===== Stock Alert Filters Schema =====
export const stockAlertFiltersSchema = z.object({
    type: StockAlertTypeEnum.optional(),
    isRead: z.coerce.boolean().optional(),
    productId: z.string().uuid().optional(),
    ingredientId: z.string().uuid().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ===== Type Exports =====
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type StockFilters = z.infer<typeof stockFiltersSchema>;
export type StockAlertFilters = z.infer<typeof stockAlertFiltersSchema>;
