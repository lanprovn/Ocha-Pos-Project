/**
 * Product related types
 */

import { Timestamped } from './common.types';

// ===== Product Size & Topping =====
export interface ProductSize {
  id: string;
  productId: string;
  name: string;
  extraPrice: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface ProductTopping {
  id: string;
  productId: string;
  name: string;
  extraPrice: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ===== Product (Backend API Response) =====
export interface Product extends Timestamped {
  id: string; // UUID
  name: string;
  description?: string | null;
  price: number;
  categoryId?: string | null;
  image?: string | null;
  rating?: number | null;
  discount?: number | null;
  stock: number;
  isAvailable: boolean;
  isPopular: boolean;
  tags: string[];
  sizes?: ProductSize[];
  toppings?: ProductTopping[];
  category?: {
    id: string;
    name: string;
  } | null;
}

// ===== Product Input Types =====
export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  image?: string;
  rating?: number;
  discount?: number;
  stock?: number;
  isAvailable?: boolean;
  isPopular?: boolean;
  tags?: string[];
  sizes?: Array<{ name: string; extraPrice: number }>;
  toppings?: Array<{ name: string; extraPrice: number }>;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  image?: string;
  rating?: number;
  discount?: number;
  stock?: number;
  isAvailable?: boolean;
  isPopular?: boolean;
  tags?: string[];
}

