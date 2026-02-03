/**
 * Product related types
 */

import { UUID, Timestamped } from './common';

// ===== Size & Topping =====

export interface ProductSize {
    id?: UUID;
    name: string;
    extraPrice: number;
}

export interface ProductTopping {
    id?: UUID;
    name: string;
    extraPrice: number;
}

// ===== Category =====

export interface Category extends Partial<Timestamped> {
    id: UUID | number;
    name: string;
    image?: string | null;
    description?: string | null;
    icon?: string | null;
    productCount?: number;
}

// ===== Product =====

export interface Product extends Partial<Timestamped> {
    id: UUID | number;
    name: string;
    description?: string | null;
    price: number;
    categoryId?: UUID | null;
    category?: string; // Category name for frontend display
    image?: string | null;
    rating?: number | null;
    discount?: number | null;
    stock?: number;
    isAvailable?: boolean;
    isPopular?: boolean;
    tags?: string[];
    sizes?: ProductSize[];
    toppings?: ProductTopping[];
}

// ===== Product Input Types =====

export interface CreateProductInput {
    name: string;
    description?: string | null;
    price: number;
    categoryId?: UUID | null;
    image?: string | null;
    discount?: number | null;
    stock?: number;
    isAvailable?: boolean;
    isPopular?: boolean;
    tags?: string[];
    sizes?: Omit<ProductSize, 'id'>[];
    toppings?: Omit<ProductTopping, 'id'>[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> { }

// ===== Product Filters =====

export interface ProductFilters {
    search?: string;
    categoryId?: UUID;
    isAvailable?: boolean;
    isPopular?: boolean;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'rating' | 'popular' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
