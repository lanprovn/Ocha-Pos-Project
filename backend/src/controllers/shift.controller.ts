import { Request, Response, NextFunction } from 'express';
import shiftService from '../services/shift.service';
import { z } from 'zod';
import { ShiftStatus } from '../types/shift.types';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation schemas
const createShiftSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    userName: z.string().min(1),
    openingCash: z.number().nonnegative(),
    notes: z.string().optional().nullable(),
  }),
});

const autoOpenShiftSchema = z.object({
  body: z.object({
    openingCash: z.number().nonnegative().optional(),
    notes: z.string().optional().nullable(),
  }),
});

const closeShiftSchema = z.object({
  body: z.object({
    closingCash: z.number().nonnegative(),
    notes: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

const updateShiftSchema = z.object({
  body: z.object({
    notes: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export class ShiftController {
  /**
   * Get all shifts
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        userId: req.query.userId as string | undefined,
        status: req.query.status as ShiftStatus | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      const result = await shiftService.getAll(filters);

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
   * Get shift by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const shift = await shiftService.getById(id);
      res.json(shift);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current open shift
   */
  async getCurrentOpen(_req: Request, res: Response, next: NextFunction) {
    try {
      const shift = await shiftService.getCurrentOpenShift();
      if (!shift) {
        res.status(404).json({
          error: 'Không có ca làm việc đang mở',
          errorCode: 'NO_OPEN_SHIFT',
        });
        return;
      }
      res.json(shift);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shift summary with statistics
   */
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const summary = await shiftService.getShiftSummary(id);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new shift (open shift)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createShiftSchema.parse({ body: req.body });
      const shift = await shiftService.create(validated.body);
      res.status(201).json(shift);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Auto-open shift for staff (check-in)
   * Automatically opens shift with default opening cash (0) when staff logs in
   */
  async autoOpen(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Get user from authenticated request
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validated = autoOpenShiftSchema.parse({ body: req.body || {} });
      const shift = await shiftService.autoOpenForStaff({
        userId: req.user.userId,
        userName: req.user.email, // Will be updated with actual name if available
        openingCash: validated.body.openingCash ?? 0,
        notes: validated.body.notes || null,
      });
      res.status(201).json(shift);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Close shift
   */
  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = closeShiftSchema.parse({
        body: req.body,
        params: req.params,
      });
      const shift = await shiftService.close(validated.params.id, validated.body);
      res.json(shift);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update shift
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateShiftSchema.parse({
        body: req.body,
        params: req.params,
      });
      const shift = await shiftService.update(validated.params.id, validated.body);
      res.json(shift);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete shift
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await shiftService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ShiftController();
