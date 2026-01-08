import { Request, Response } from 'express';
import priceHistoryService from '@services/price-history.service';
import { z } from 'zod';

export class PriceHistoryController {
  async getByProductId(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const history = await priceHistoryService.getByProductId(productId);
      res.json(history);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const result = await priceHistoryService.getAll(page, limit);
      res.json(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default new PriceHistoryController();




