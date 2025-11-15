import { Request, Response } from 'express';
import recipeService from '../services/recipe.service';
import { z } from 'zod';
import { BaseController } from './base.controller';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';
import { SUCCESS_MESSAGES } from '../constants';

const createRecipeSchema = z.object({
  productId: ValidationSchemas.uuid,
  ingredientId: ValidationSchemas.uuid,
  quantity: ValidationSchemas.positiveNumber,
  unit: z.string().min(1, 'Đơn vị không được để trống'),
});

const updateRecipeSchema = z.object({
  quantity: ValidationSchemas.positiveNumber.optional(),
  unit: z.string().min(1, 'Đơn vị không được để trống').optional(),
});

const idParamSchema = z.object({
  id: ValidationSchemas.uuid,
});

const productIdParamSchema = z.object({
  productId: ValidationSchemas.uuid,
});

const ingredientIdParamSchema = z.object({
  ingredientId: ValidationSchemas.uuid,
});

export class RecipeController extends BaseController {
  /**
   * Create or update recipe
   */
  create = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createRecipeSchema, req.body);
    const recipe = await recipeService.create(validated);
    this.created(res, recipe, SUCCESS_MESSAGES.CREATED);
  });

  /**
   * Get recipes by product
   */
  getByProduct = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId } = validateOrThrow(productIdParamSchema, req.params);
    const recipes = await recipeService.getByProduct(productId);
    this.success(res, recipes);
  });

  /**
   * Get recipes by ingredient
   */
  getByIngredient = this.asyncHandler(async (req: Request, res: Response) => {
    const { ingredientId } = validateOrThrow(ingredientIdParamSchema, req.params);
    const recipes = await recipeService.getByIngredient(ingredientId);
    this.success(res, recipes);
  });

  /**
   * Get recipe by ID
   */
  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const recipe = await recipeService.getById(id);
    this.success(res, recipe);
  });

  /**
   * Update recipe
   */
  update = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(updateRecipeSchema, req.body);
    const recipe = await recipeService.update(id, validated);
    this.success(res, recipe, SUCCESS_MESSAGES.UPDATED);
  });

  /**
   * Delete recipe
   */
  delete = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    await recipeService.delete(id);
    this.success(res, null, SUCCESS_MESSAGES.DELETED);
  });
}

export default new RecipeController();

