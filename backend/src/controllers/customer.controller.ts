import { Request, Response, NextFunction } from 'express';
import customerService, {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFilters,
  UpdateLoyaltyPointsInput,
} from '../services/customer.service';
import { z } from 'zod';

const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    email: z.string().email('Invalid email format').optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    gender: z.string().optional(),
    avatar: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    gender: z.string().optional(),
    avatar: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateLoyaltyPointsSchema = z.object({
  body: z.object({
    points: z.number().int().positive('Points must be positive'),
    type: z.enum(['EARN', 'REDEEM', 'EXPIRED', 'ADJUSTMENT']),
    reason: z.string().optional(),
    orderId: z.string().optional(),
  }),
});

export class CustomerController {
  /**
   * Get all customers with filters
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: CustomerFilters = {
        search: req.query.search as string,
        membershipLevel: req.query.membershipLevel as any,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await customerService.getAll(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.getById(req.params.id);
      res.json(customer);
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        res.status(404).json({ error: error.message, errorCode: 'CUSTOMER_NOT_FOUND' });
        return;
      }
      next(error);
    }
  }

  /**
   * Get customer by phone
   */
  async getByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const phone = req.query.phone as string;
      if (!phone) {
        res.status(400).json({ error: 'Phone parameter is required', errorCode: 'VALIDATION_ERROR' });
        return;
      }

      const customer = await customerService.getByPhone(phone);
      if (!customer) {
        res.status(404).json({ error: 'Customer not found', errorCode: 'CUSTOMER_NOT_FOUND' });
        return;
      }

      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new customer
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCustomerSchema.parse({ body: req.body });
      const customer = await customerService.create(validated.body as CreateCustomerInput);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          errorCode: 'VALIDATION_ERROR',
          details: error.errors,
        });
        return;
      }
      if (error instanceof Error && (error.message.includes('already exists') || error.message.includes('Phone number'))) {
        res.status(409).json({ error: error.message, errorCode: 'DUPLICATE_ERROR' });
        return;
      }
      next(error);
    }
  }

  /**
   * Update customer
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateCustomerSchema.parse({ body: req.body });
      const customer = await customerService.update(req.params.id, validated.body as UpdateCustomerInput);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          errorCode: 'VALIDATION_ERROR',
          details: error.errors,
        });
        return;
      }
      if (error instanceof Error && error.message === 'Customer not found') {
        res.status(404).json({ error: error.message, errorCode: 'CUSTOMER_NOT_FOUND' });
        return;
      }
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message, errorCode: 'DUPLICATE_ERROR' });
        return;
      }
      next(error);
    }
  }

  /**
   * Delete customer (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await customerService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        res.status(404).json({ error: error.message, errorCode: 'CUSTOMER_NOT_FOUND' });
        return;
      }
      next(error);
    }
  }

  /**
   * Update customer loyalty points
   */
  async updateLoyaltyPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateLoyaltyPointsSchema.parse({ body: req.body });
      const customer = await customerService.updateLoyaltyPoints(
        req.params.id,
        validated.body as UpdateLoyaltyPointsInput
      );
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          errorCode: 'VALIDATION_ERROR',
          details: error.errors,
        });
        return;
      }
      if (error instanceof Error && error.message === 'Customer not found') {
        res.status(404).json({ error: error.message, errorCode: 'CUSTOMER_NOT_FOUND' });
        return;
      }
      if (error instanceof Error && error.message.includes('Insufficient')) {
        res.status(400).json({ error: error.message, errorCode: 'INSUFFICIENT_POINTS' });
        return;
      }
      next(error);
    }
  }

  /**
   * Get customer statistics
   */
  async getStatistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await customerService.getStatistics();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get membership benefits information
   */
  async getMembershipBenefits(_req: Request, res: Response, next: NextFunction) {
    try {
      const { MEMBERSHIP_DISCOUNT_RATES, MEMBERSHIP_POINT_RATES, MEMBERSHIP_THRESHOLDS } = await import('../constants/membership.constants');
      
      const benefits = {
        BRONZE: {
          discountRate: MEMBERSHIP_DISCOUNT_RATES.BRONZE,
          pointRate: MEMBERSHIP_POINT_RATES.BRONZE,
          threshold: MEMBERSHIP_THRESHOLDS.BRONZE,
          nextLevel: 'SILVER' as const,
          nextThreshold: MEMBERSHIP_THRESHOLDS.SILVER,
        },
        SILVER: {
          discountRate: MEMBERSHIP_DISCOUNT_RATES.SILVER,
          pointRate: MEMBERSHIP_POINT_RATES.SILVER,
          threshold: MEMBERSHIP_THRESHOLDS.SILVER,
          nextLevel: 'GOLD' as const,
          nextThreshold: MEMBERSHIP_THRESHOLDS.GOLD,
        },
        GOLD: {
          discountRate: MEMBERSHIP_DISCOUNT_RATES.GOLD,
          pointRate: MEMBERSHIP_POINT_RATES.GOLD,
          threshold: MEMBERSHIP_THRESHOLDS.GOLD,
          nextLevel: 'PLATINUM' as const,
          nextThreshold: MEMBERSHIP_THRESHOLDS.PLATINUM,
        },
        PLATINUM: {
          discountRate: MEMBERSHIP_DISCOUNT_RATES.PLATINUM,
          pointRate: MEMBERSHIP_POINT_RATES.PLATINUM,
          threshold: MEMBERSHIP_THRESHOLDS.PLATINUM,
          nextLevel: null,
          nextThreshold: null,
        },
      };
      
      res.json(benefits);
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();

