import { Request, Response, NextFunction } from 'express';
import dashboardService from '@services/dashboard.service';

export class DashboardController {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getDailySales(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const dailySales = await dashboardService.getDailySales(date);
      res.json(dailySales);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();

