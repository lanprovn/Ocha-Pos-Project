import prisma from '../config/database';
import { BaseRepository } from './base.repository';
import { CreateRecipeInput, UpdateRecipeInput } from '../types/recipe.types';
import { Decimal } from '@prisma/client/runtime/library';

export class RecipeRepository extends BaseRepository<any> {
  protected model = prisma.productRecipe;

  /**
   * Find recipe by productId and ingredientId
   */
  async findByProductAndIngredient(productId: string, ingredientId: string) {
    return prisma.productRecipe.findUnique({
      where: {
        productId_ingredientId: {
          productId,
          ingredientId,
        },
      },
    });
  }

  /**
   * Find recipes by product ID
   */
  async findByProductId(productId: string) {
    return prisma.productRecipe.findMany({
      where: { productId },
      include: {
        product: true,
        ingredient: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Find recipes by ingredient ID
   */
  async findByIngredientId(ingredientId: string) {
    return prisma.productRecipe.findMany({
      where: { ingredientId },
      include: {
        product: true,
        ingredient: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Find recipes by multiple product IDs
   */
  async findByProductIds(productIds: string[]) {
    return prisma.productRecipe.findMany({
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
  }

  /**
   * Create recipe
   */
  async create(data: CreateRecipeInput) {
    return prisma.productRecipe.create({
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
  }

  /**
   * Update recipe
   */
  async update(id: string, data: UpdateRecipeInput) {
    const updateData: any = {};
    if (data.quantity !== undefined) {
      updateData.quantity = new Decimal(data.quantity);
    }
    if (data.unit !== undefined) {
      updateData.unit = data.unit;
    }

    return prisma.productRecipe.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        ingredient: true,
      },
    });
  }

  /**
   * Delete recipes by product ID
   */
  async deleteByProductId(productId: string) {
    return prisma.productRecipe.deleteMany({
      where: { productId },
    });
  }
}

export default new RecipeRepository();

