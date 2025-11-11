import { Request, Response } from 'express';
import recipeService from '../services/recipe.service';
import { z } from 'zod';

const createRecipeSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    quantity: z.number().positive(),
    unit: z.string().min(1),
  }),
});

const updateRecipeSchema = z.object({
  body: z.object({
    quantity: z.number().positive().optional(),
    unit: z.string().min(1).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export class RecipeController {
  /**
   * Create or update recipe
   */
  async create(req: Request, res: Response) {
    try {
      const validated = createRecipeSchema.parse({ body: req.body });
      const recipe = await recipeService.create(validated.body);
      res.status(201).json(recipe);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * Get recipes by product
   */
  async getByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const recipes = await recipeService.getByProduct(productId);
      res.json(recipes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get recipes by ingredient
   */
  async getByIngredient(req: Request, res: Response) {
    try {
      const { ingredientId } = req.params;
      const recipes = await recipeService.getByIngredient(ingredientId);
      res.json(recipes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get recipe by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const recipe = await recipeService.getById(id);
      res.json(recipe);
    } catch (error: any) {
      if (error.message === 'Recipe not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * Update recipe
   */
  async update(req: Request, res: Response) {
    try {
      const validated = updateRecipeSchema.parse({
        body: req.body,
        params: req.params,
      });
      const recipe = await recipeService.update(validated.params.id, validated.body);
      res.json(recipe);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.message === 'Recipe not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * Delete recipe
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await recipeService.delete(id);
      res.json({ message: 'Recipe deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Recipe not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default new RecipeController();

