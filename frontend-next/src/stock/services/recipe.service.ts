"use client";
import apiClient from '@lib/api.service';

export interface RecipeItem {
  id: string;
  productId: string;
  ingredientId: string;
  quantity: string;
  unit: string;
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
  product: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeInput {
  productId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
}

export interface UpdateRecipeInput {
  quantity?: number;
  unit?: string;
}

class RecipeService {
  /**
   * Create or update recipe
   */
  async create(data: CreateRecipeInput): Promise<RecipeItem> {
    return apiClient.post<RecipeItem>('/recipes', data);
  }

  /**
   * Get recipes by product
   */
  async getByProduct(productId: string): Promise<RecipeItem[]> {
    return apiClient.get<RecipeItem[]>(`/recipes/product/${productId}`);
  }

  /**
   * Get recipes by ingredient
   */
  async getByIngredient(ingredientId: string): Promise<RecipeItem[]> {
    return apiClient.get<RecipeItem[]>(`/recipes/ingredient/${ingredientId}`);
  }

  /**
   * Get recipe by ID
   */
  async getById(id: string): Promise<RecipeItem> {
    return apiClient.get<RecipeItem>(`/recipes/${id}`);
  }

  /**
   * Update recipe
   */
  async update(id: string, data: UpdateRecipeInput): Promise<RecipeItem> {
    return apiClient.put<RecipeItem>(`/recipes/${id}`, data);
  }

  /**
   * Delete recipe
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/recipes/${id}`);
  }
}

export default new RecipeService();

