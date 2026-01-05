import { Request, Response } from 'express';
import categoryService from '@services/category.service';
import { transformCategory } from '@utils/transform';
import { z } from 'zod';

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    image: z.string().url().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    image: z.string().url().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export class CategoryController {
  async getAll(_req: Request, res: Response) {
    try {
      const categories = await categoryService.getAll();
      const transformed = categories.map(transformCategory);
      res.json(transformed);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await categoryService.getById(id);
      const transformed = transformCategory(category);
      res.json(transformed);
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validated = createCategorySchema.parse({ body: req.body });
      const category = await categoryService.create(validated.body);
      const transformed = transformCategory(category);
      res.status(201).json(transformed);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const validated = updateCategorySchema.parse({
        body: req.body,
        params: req.params,
      });
      const category = await categoryService.update(validated.params.id, validated.body);
      const transformed = transformCategory(category);
      res.json(transformed);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await categoryService.delete(id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default new CategoryController();

