import { Request, Response, NextFunction } from 'express';
import promotionService from '@services/promotion.service';
import { z } from 'zod';

const getAllPromotionsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    isActive: z.string().optional().transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
    type: z.enum(['PRODUCT', 'CATEGORY', 'ORDER', 'CUSTOMER', 'TIME_BASED', 'UNIVERSAL']).optional(),
    search: z.string().optional(),
  }),
});

const createPromotionSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Mã khuyến mãi không được để trống').transform((val) => val.toUpperCase()),
    name: z.string().min(1, 'Tên khuyến mãi không được để trống'),
    description: z.string().optional(),
    type: z.enum(['PRODUCT', 'CATEGORY', 'ORDER', 'CUSTOMER', 'TIME_BASED', 'UNIVERSAL']),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    discountValue: z.number().min(0, 'Giá trị giảm giá phải >= 0'),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    productIds: z.array(z.string().uuid()).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
    membershipLevels: z.array(z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'])).optional(),
    startDate: z.string().datetime().transform((val) => new Date(val)),
    endDate: z.string().datetime().transform((val) => new Date(val)),
    startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    usageLimit: z.number().int().min(1).optional(),
    perUserLimit: z.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

const updatePromotionSchema = z.object({
  body: z.object({
    code: z.string().min(1).transform((val) => val.toUpperCase()).optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    type: z.enum(['PRODUCT', 'CATEGORY', 'ORDER', 'CUSTOMER', 'TIME_BASED', 'UNIVERSAL']).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
    discountValue: z.number().min(0).optional(),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    productIds: z.array(z.string().uuid()).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
    membershipLevels: z.array(z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'])).optional(),
    startDate: z.string().datetime().transform((val) => new Date(val)).optional(),
    endDate: z.string().datetime().transform((val) => new Date(val)).optional(),
    startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    usageLimit: z.number().int().min(1).optional(),
    perUserLimit: z.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

const validatePromotionSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    orderAmount: z.number().min(0).optional(),
    productIds: z.array(z.string().uuid()).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
    customerMembershipLevel: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
    customerId: z.string().uuid().optional(),
  }),
});

const getStatisticsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
    endDate: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  }),
});

export class PromotionController {
  /**
   * Get all promotions
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getAllPromotionsSchema.parse({ query: req.query });
      const result = await promotionService.getAll(validated.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get promotion by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const promotion = await promotionService.getById(id);
      res.json(promotion);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get promotion by code
   */
  async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const promotion = await promotionService.getByCode(code);
      if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
      }
      res.json(promotion);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create promotion
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createPromotionSchema.parse({ body: req.body });
      const promotion = await promotionService.create(validated.body);
      res.status(201).json(promotion);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update promotion
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updatePromotionSchema.parse({ body: req.body });
      const promotion = await promotionService.update(id, validated.body);
      res.json(promotion);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete promotion
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await promotionService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate and apply promotion
   */
  async validateAndApply(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = validatePromotionSchema.parse({ body: req.body });
      const orderAmount = validated.body.orderAmount || 0;
      const result = await promotionService.validateAndApply(validated.body, orderAmount);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getStatisticsSchema.parse({ query: req.query });
      const statistics = await promotionService.getStatistics(validated.query.startDate, validated.query.endDate);
      res.json(statistics);
    } catch (error) {
      next(error);
    }
  }
}

export default new PromotionController();

