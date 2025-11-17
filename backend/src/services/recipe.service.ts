import prisma from '../config/database';
import { CreateRecipeInput, UpdateRecipeInput, RecipeItem } from '../types/recipe.types';
import { Decimal } from '@prisma/client/runtime/library';

export class RecipeService {
  /**
   * Create recipe item
   */
  async create(data: CreateRecipeInput): Promise<RecipeItem> {
    // Check if recipe already exists
    const existing = await prisma.productRecipe.findUnique({
      where: {
        productId_ingredientId: {
          productId: data.productId,
          ingredientId: data.ingredientId,
        },
      },
    });

    if (existing) {
      // Update existing recipe
      return this.update(existing.id, { quantity: data.quantity, unit: data.unit });
    }

    const recipe = await prisma.productRecipe.create({
      data: {
        productId: data.productId,
        ingredientId: data.ingredientId,
        quantity: new Decimal(data.quantity),
        unit: data.unit,
      },
      include: {
        product: true,
        ingredient: true,
      },
    });

    return this.transformRecipe(recipe);
  }

  /**
   * Get all recipes for a product
   */
  async getByProduct(productId: string): Promise<RecipeItem[]> {
    const recipes = await prisma.productRecipe.findMany({
      where: { productId },
      include: {
        product: true,
        ingredient: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return recipes.map((recipe) => this.transformRecipe(recipe));
  }

  /**
   * Get all recipes for an ingredient
   */
  async getByIngredient(ingredientId: string): Promise<RecipeItem[]> {
    const recipes = await prisma.productRecipe.findMany({
      where: { ingredientId },
      include: {
        product: true,
        ingredient: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return recipes.map((recipe) => this.transformRecipe(recipe));
  }

  /**
   * Get recipe by ID
   */
  async getById(id: string): Promise<RecipeItem> {
    const recipe = await prisma.productRecipe.findUnique({
      where: { id },
      include: {
        product: true,
        ingredient: true,
      },
    });

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    return this.transformRecipe(recipe);
  }

  /**
   * Update recipe
   */
  async update(id: string, data: UpdateRecipeInput): Promise<RecipeItem> {
    const updateData: any = {};
    if (data.quantity !== undefined) {
      updateData.quantity = new Decimal(data.quantity);
    }
    if (data.unit !== undefined) {
      updateData.unit = data.unit;
    }

    const recipe = await prisma.productRecipe.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        ingredient: true,
      },
    });

    return this.transformRecipe(recipe);
  }

  /**
   * Delete recipe
   */
  async delete(id: string): Promise<void> {
    await prisma.productRecipe.delete({
      where: { id },
    });
  }

  /**
   * Delete all recipes for a product
   */
  async deleteByProduct(productId: string): Promise<void> {
    await prisma.productRecipe.deleteMany({
      where: { productId },
    });
  }

  /**
   * Get recipes for multiple products (for order processing)
   */
  async getByProducts(productIds: string[]): Promise<RecipeItem[]> {
    const recipes = await prisma.productRecipe.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      include: {
        product: true,
        ingredient: true,
      },
    });

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

