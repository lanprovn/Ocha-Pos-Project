import apiClient from '@lib/api.service';
import { API_ENDPOINTS } from '@/config/api';
import type { Product, Category } from '@/types/product';

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

export const productService = {
  // Get all products
  async getAll(): Promise<Product[]> {
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS);
  },

  // Get product by ID
  async getById(id: string): Promise<Product> {
    return apiClient.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id));
  },

  // Create product
  async create(data: CreateProductInput): Promise<Product> {
    return apiClient.post<Product>(API_ENDPOINTS.PRODUCTS, data);
  },

  // Update product
  async update(id: string, data: UpdateProductInput): Promise<Product> {
    return apiClient.patch<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id), data);
  },

  // Delete product
  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
  },
};

export const categoryService = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    return apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES);
  },

  // Get category by ID
  async getById(id: string): Promise<Category> {
    return apiClient.get<Category>(API_ENDPOINTS.CATEGORY_BY_ID(id));
  },

  // Create category
  async create(data: Partial<Category>): Promise<Category> {
    return apiClient.post<Category>(API_ENDPOINTS.CATEGORIES, data);
  },

  // Update category
  async update(id: string, data: Partial<Category>): Promise<Category> {
    return apiClient.patch<Category>(API_ENDPOINTS.CATEGORY_BY_ID(id), data);
  },

  // Delete category
  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CATEGORY_BY_ID(id));
  },
};

