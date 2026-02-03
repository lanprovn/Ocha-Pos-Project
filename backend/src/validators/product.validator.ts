/**
 * Product Validators using Zod
 * Centralized validation schemas for product-related inputs
 */

import { z } from 'zod';

// ===== Product Size Schema =====
export const productSizeSchema = z.object({
    name: z.string().min(1, 'Size name is required').max(50),
    extraPrice: z.number().nonnegative('Extra price cannot be negative').default(0),
});

// ===== Product Topping Schema =====
export const productToppingSchema = z.object({
    name: z.string().min(1, 'Topping name is required').max(100),
    extraPrice: z.number().nonnegative('Extra price cannot be negative').default(0),
});

// ===== Create Product Schema =====
export const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(200),
    description: z.string().max(1000).nullable().optional(),
    price: z.number().nonnegative('Price cannot be negative'),
    categoryId: z.string().uuid('Invalid category ID').nullable().optional(),
    image: z.string().url('Invalid image URL').nullable().optional(),
    discount: z.number().min(0).max(100, 'Discount must be 0-100').nullable().optional(),
    stock: z.number().int().nonnegative('Stock cannot be negative').optional().default(0),
    isAvailable: z.boolean().optional().default(true),
    isPopular: z.boolean().optional().default(false),
    tags: z.array(z.string().max(50)).optional().default([]),
    sizes: z.array(productSizeSchema).optional().default([]),
    toppings: z.array(productToppingSchema).optional().default([]),
});

// ===== Update Product Schema =====
export const updateProductSchema = createProductSchema.partial();

// ===== Product Filters Schema =====
export const productFiltersSchema = z.object({
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    isAvailable: z.coerce.boolean().optional(),
    isPopular: z.coerce.boolean().optional(),
    tags: z.string().optional(), // Comma-separated
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(['name', 'price', 'rating', 'popular', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ===== Category Schema =====
export const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    image: z.string().url('Invalid image URL').nullable().optional(),
    description: z.string().max(500).nullable().optional(),
    icon: z.string().max(50).nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ===== Type Exports =====
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
