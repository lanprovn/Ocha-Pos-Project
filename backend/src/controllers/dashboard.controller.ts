import { Request, Response } from 'express';
import dashboardService from '../services/dashboard.service';
import { BaseController } from './base.controller';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';
import { z } from 'zod';

const dateQuerySchema = z.object({
  date: ValidationSchemas.dateString.optional(),
});

export class DashboardController extends BaseController {
  /**
   * Get dashboard statistics
   */
  getStats = this.asyncHandler(async (_req: Request, res: Response) => {
    const stats = await dashboardService.getStats();
    this.success(res, stats);
  });

  /**
   * Get daily sales
   */
  getDailySales = this.asyncHandler(async (req: Request, res: Response) => {
    const query = validateOrThrow(dateQuerySchema, req.query);
    const dailySales = await dashboardService.getDailySales(query.date);
    this.success(res, dailySales);
  });
}

// Export instance
const dashboardController = new DashboardController();
export default dashboardController;

