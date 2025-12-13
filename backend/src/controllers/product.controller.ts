import { Request, Response } from 'express';
import productService from '../services/product.service';
import { transformProduct } from '../utils/transform';
import { z } from 'zod';

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    categoryId: z.string().uuid().optional(),
    image: z.string().url().optional(),
    rating: z.number().min(0).max(5).optional(),
    discount: z.number().min(0).max(100).optional(),
    stock: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    sizes: z
      .array(
        z.object({
          name: z.string(),
          extraPrice: z.number().min(0),
        })
      )
      .optional(),
    toppings: z
      .array(
        z.object({
          name: z.string(),
          extraPrice: z.number().min(0),
        })
      )
      .optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    categoryId: z.string().uuid().optional(),
    image: z.string().url().optional(),
    rating: z.number().min(0).max(5).optional(),
    discount: z.number().min(0).max(100).optional(),
    stock: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
    isPopular: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      // Parse pagination params (optional - backward compatible)
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const includeAll = req.query.includeAll === 'true' || (!page && !limit);

      const products = await productService.getAll(page, limit, includeAll);
      const transformed = products.map(transformProduct);

      // If pagination is used, include metadata
      if (!includeAll && page && limit) {
        const total = await productService.getCount();
        const totalPages = Math.ceil(total / limit);

        res.json({
          data: transformed,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        });
      } else {
        res.json(transformed);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getById(id);
      const transformed = transformProduct(product);
      res.json(transformed);
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validated = createProductSchema.parse({ body: req.body });
      const product = await productService.create(validated.body);
      const transformed = transformProduct(product);
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
      const validated = updateProductSchema.parse({
        body: req.body,
        params: req.params,
      });
      const product = await productService.update(validated.params.id, validated.body);
      const transformed = transformProduct(product);
      res.json(transformed);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await productService.delete(id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default new ProductController();

