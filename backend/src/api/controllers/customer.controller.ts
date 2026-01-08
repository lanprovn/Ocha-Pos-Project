import { Request, Response, NextFunction } from 'express';
import customerService from '@services/customer.service';
import { z } from 'zod';
import { MEMBERSHIP_CONFIGS, getMembershipConfig, getDiscountRate } from '@config/membership.config';

const getAllCustomersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    search: z.string().optional(),
    membershipLevel: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
    tags: z.string().optional().transform((val) => {
      if (!val) return undefined;
      return val.split(',').filter(Boolean);
    }),
    isActive: z.string().optional().transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  }),
});

const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên không được để trống').optional(),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ').optional(),
    email: z.string().email('Email không hợp lệ').nullable().optional(),
    address: z.string().nullable().optional(),
    dateOfBirth: z
      .union([z.string().datetime(), z.string()])
      .nullable()
      .transform((val) => {
        if (!val || val === '') return null;
        const date = new Date(val);
        return isNaN(date.getTime()) ? null : date;
      })
      .optional(),
    gender: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    membershipLevel: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
    isActive: z.boolean().optional(),
  }),
});

const adjustLoyaltyPointsSchema = z.object({
  body: z.object({
    points: z.number().int('Số điểm phải là số nguyên').refine((val) => val !== 0, 'Số điểm phải khác 0'),
    reason: z.string().min(1, 'Lý do không được để trống'),
  }),
});

export class CustomerController {
  /**
   * Get all customers with filters
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = getAllCustomersSchema.parse({ query: req.query });
      const result = await customerService.getAll(validated.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer by ID with full details
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await customerService.getById(id);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available tags
   */
  async getAvailableTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await customerService.getAvailableTags();
      res.json({ tags });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update customer information
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateCustomerSchema.parse({ body: req.body });
      const customer = await customerService.update(id, validated.body);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adjust loyalty points manually
   */
  async adjustLoyaltyPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = adjustLoyaltyPointsSchema.parse({ body: req.body });
      const userId = (req as any).user?.id;
      const customer = await customerService.adjustLoyaltyPoints(
        id,
        validated.body.points,
        validated.body.reason,
        userId
      );
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer statistics (VIP, frequent customers, etc.)
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const statistics = await customerService.getStatistics();
      res.json(statistics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find customer by phone number
   */
  async findByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.params;
      if (!phone) {
        return res.status(400).json({ error: 'Số điện thoại là bắt buộc' });
      }
      const customer = await customerService.findByPhone(phone);
      if (!customer) {
        return res.json({ customer: null, exists: false });
      }
      res.json({ customer, exists: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find customer by phone number or create new one
   * Public endpoint for checkout - automatically saves customer when phone and name are provided
   */
  async findOrCreateByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, name } = req.body;
      
      if (!phone) {
        return res.status(400).json({ error: 'Số điện thoại là bắt buộc' });
      }

      const result = await customerService.findOrCreateByPhonePublic(phone, name);
      
      if (!result.customer) {
        return res.json({ 
          customer: null, 
          exists: false, 
          created: false 
        });
      }

      res.json({
        customer: result.customer,
        exists: !result.created,
        created: result.created,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get membership levels configuration
   */
  async getMembershipConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ configs: MEMBERSHIP_CONFIGS });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get discount rate for a membership level
   */
  async getDiscountRate(req: Request, res: Response, next: NextFunction) {
    try {
      const { level } = req.params;
      if (!level || !['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].includes(level)) {
        return res.status(400).json({ error: 'Cấp độ thành viên không hợp lệ' });
      }
      const discountRate = getDiscountRate(level as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM');
      const config = getMembershipConfig(level as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM');
      res.json({ level, discountRate, config });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Recalculate membership levels for all customers
   */
  async recalculateAllMembershipLevels(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await customerService.recalculateAllMembershipLevels();
      res.json({
        message: 'Đã cập nhật cấp độ thành viên cho tất cả khách hàng',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();

