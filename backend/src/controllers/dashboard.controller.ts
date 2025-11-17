import { Request, Response } from 'express';
import dashboardService from '../services/dashboard.service';

export class DashboardController {
  async getStats(_req: Request, res: Response) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDailySales(req: Request, res: Response) {
    try {
      const date = req.query.date as string | undefined;
      const dailySales = await dashboardService.getDailySales(date);
      res.json(dailySales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new DashboardController();

