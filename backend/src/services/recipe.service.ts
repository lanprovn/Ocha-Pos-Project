import { CreateRecipeInput, UpdateRecipeInput, RecipeItem } from '../types/recipe.types';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { recipeRepository } from '../repositories';

export class RecipeService {
  constructor(private repository = recipeRepository) {}

  /**
   * Create recipe item
   */
  async create(data: CreateRecipeInput): Promise<RecipeItem> {
    // Check if recipe already exists
    const existing = await this.repository.findByProductAndIngredient(data.productId, data.ingredientId);

    if (existing) {
      // Update existing recipe
      return this.update(existing.id, { quantity: data.quantity, unit: data.unit });
    }

    const recipe = await this.repository.create(data);
    return this.transformRecipe(recipe);
  }

  /**
   * Get all recipes for a product
   */
  async getByProduct(productId: string): Promise<RecipeItem[]> {
    const recipes = await this.repository.findByProductId(productId);
    return recipes.map((recipe) => this.transformRecipe(recipe));
  }

  /**
   * Get all recipes for an ingredient
   */
  async getByIngredient(ingredientId: string): Promise<RecipeItem[]> {
    const recipes = await this.repository.findByIngredientId(ingredientId);
    return recipes.map((recipe) => this.transformRecipe(recipe));
  }

  /**
   * Get recipe by ID
   */
  async getById(id: string): Promise<RecipeItem> {
    const recipe = await this.repository.findById(id);

    if (!recipe) {
      throw new AppError(ERROR_MESSAGES.RECIPE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.transformRecipe(recipe);
  }

  /**
   * Update recipe
   */
  async update(id: string, data: UpdateRecipeInput): Promise<RecipeItem> {
    // Check if recipe exists
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError(ERROR_MESSAGES.RECIPE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const recipe = await this.repository.update(id, data);
    return this.transformRecipe(recipe);
  }

  /**
   * Delete recipe
   */
  async delete(id: string): Promise<void> {
    // Check if recipe exists
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError(ERROR_MESSAGES.RECIPE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await this.repository.delete(id);
  }

  /**
   * Delete all recipes for a product
   */
  async deleteByProduct(productId: string): Promise<void> {
    await this.repository.deleteByProductId(productId);
  }

  /**
   * Get recipes for multiple products (for order processing)
   */
  async getByProducts(productIds: string[]): Promise<RecipeItem[]> {
    const recipes = await this.repository.findByProductIds(productIds);
    return recipes.map((recipe) => this.transformRecipe(recipe));
  }

  /**
   * Transform recipe to frontend format
   */
  private transformRecipe(recipe: any): RecipeItem {
    return {
      id: recipe.id,
      productId: recipe.productId,
      ingredientId: recipe.ingredientId,
      quantity: recipe.quantity.toString(),
      unit: recipe.unit,
      ingredient: {
        id: recipe.ingredient.id,
        name: recipe.ingredient.name,
        unit: recipe.ingredient.unit,
      },
      product: {
        id: recipe.product.id,
        name: recipe.product.name,
      },
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
    };
  }
}

export default new RecipeService();

