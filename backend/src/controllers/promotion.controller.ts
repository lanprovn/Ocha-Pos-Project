import { Request, Response, NextFunction } from 'express';
import promotionService from '../services/promotion.service';
import { z } from 'zod';
import { PromotionType } from '../types/promotion.types';

// Validation schemas
const createPromotionCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    description: z.string().optional().nullable(),
    type: z.nativeEnum(PromotionType),
    value: z.number().positive(),
    minOrderAmount: z.number().positive().optional().nullable(),
    maxDiscountAmount: z.number().positive().optional().nullable(),
    startDate: z.string().datetime().or(z.date()),
    endDate: z.string().datetime().or(z.date()),
    maxUses: z.number().int().positive().optional().nullable(),
    maxUsesPerCustomer: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

const updatePromotionCodeSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    type: z.nativeEnum(PromotionType).optional(),
    value: z.number().positive().optional(),
    minOrderAmount: z.number().positive().optional().nullable(),
    maxDiscountAmount: z.number().positive().optional().nullable(),
    startDate: z.string().datetime().or(z.date()).optional(),
    endDate: z.string().datetime().or(z.date()).optional(),
    maxUses: z.number().int().positive().optional().nullable(),
    maxUsesPerCustomer: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

const validatePromotionCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    orderAmount: z.number().positive(),
    customerId: z.string().uuid().optional().nullable(),
    customerPhone: z.string().optional().nullable(),
  }),
});

export class PromotionController {
  /**
   * Get all promotion codes
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        code: req.query.code as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      const result = await promotionService.getAll(filters);

      if (filters.page && filters.limit) {
        res.json(result);
      } else {
        res.json(result.data);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get promotion code by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const promo = await promotionService.getById(id);
      res.json(promo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get promotion code by code string
   */
  async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const promo = await promotionService.getByCode(code);
      res.json(promo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new promotion code
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createPromotionCodeSchema.parse({ body: req.body });
      const promo = await promotionService.create(validated.body);
      res.status(201).json(promo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update promotion code
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updatePromotionCodeSchema.parse({
        body: req.body,
        params: req.params,
      });
      const promo = await promotionService.update(validated.params.id, validated.body);
      res.json(promo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete promotion code
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await promotionService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate promotion code
   */
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = validatePromotionCodeSchema.parse({ body: req.body });
      const result = await promotionService.validateCode(validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new PromotionController();



