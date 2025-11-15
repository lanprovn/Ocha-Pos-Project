import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Product, Category } from '../types/product';

export const productService = {
  // Get all products with optional pagination
  // OPTIMIZED: Now supports pagination, backward compatible with old response format
  async getAll(page?: number, limit?: number): Promise<Product[]> {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.PRODUCTS}?${queryString}` : API_ENDPOINTS.PRODUCTS;
    const response = await apiClient.get<Product[] | { data: Product[]; pagination: any }>(url);
    
    // Handle paginated response (new format) or array response (old format)
    return Array.isArray(response) ? response : response.data;
  },

  // Get product by ID
  async getById(id: string): Promise<Product> {
    return apiClient.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id));
  },

  // Create product
  async create(data: any): Promise<any> {
    return apiClient.post(API_ENDPOINTS.PRODUCTS, data);
  },

  // Update product
  async update(id: string, data: any): Promise<any> {
    return apiClient.patch(API_ENDPOINTS.PRODUCT_BY_ID(id), data);
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

