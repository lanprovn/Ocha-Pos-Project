import { Request, Response } from 'express';
import { z } from 'zod';
import stockService from '../services/stock.service';

const createProductStockSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(0).optional(),
    minStock: z.number().int().min(0).optional(),
    maxStock: z.number().int().min(0).optional(),
    unit: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const deleteProductStockSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const createIngredientSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    unit: z.string().min(1),
    quantity: z.number().int().min(0).optional(),
    minStock: z.number().int().min(0).optional(),
    maxStock: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

const deleteIngredientSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ========== Product Stock ==========

export class StockController {
  // Product Stock
  async getAllProductStocks(_req: Request, res: Response) {
    try {
      const stocks = await stockService.getAllProductStocks();
      res.json(stocks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProductStockById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stock = await stockService.getProductStockById(id);
      res.json(stock);
    } catch (error: any) {
      if (error.message === 'Product stock not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async updateProductStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stock = await stockService.updateProductStock(id, req.body);
      res.json(stock);
    } catch (error: any) {
      if (error.message === 'Product stock not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async createProductStock(req: Request, res: Response) {
    try {
      const validated = createProductStockSchema.parse({ body: req.body });
      const stock = await stockService.createProductStock(validated.body);
      res.status(201).json(stock);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.message === 'Product not found' || error.message === 'Stock already exists for this product') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async deleteProductStock(req: Request, res: Response) {
    try {
      const validated = deleteProductStockSchema.parse({ params: req.params });
      const result = await stockService.deleteProductStock(validated.params.id);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.message === 'Product stock not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // Ingredient Stock
  async getAllIngredientStocks(_req: Request, res: Response) {
    try {
      const stocks = await stockService.getAllIngredientStocks();
      res.json(stocks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getIngredientStockById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stock = await stockService.getIngredientStockById(id);
      res.json(stock);
    } catch (error: any) {
      if (error.message === 'Ingredient stock not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async updateIngredientStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stock = await stockService.updateIngredientStock(id, req.body);
      res.json(stock);
    } catch (error: any) {
      if (error.message === 'Ingredient stock not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async createIngredient(req: Request, res: Response) {
    try {
      const validated = createIngredientSchema.parse({ body: req.body });
      const ingredient = await stockService.createIngredient(validated.body);
      res.status(201).json(ingredient);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async deleteIngredient(req: Request, res: Response) {
    try {
      const validated = deleteIngredientSchema.parse({ params: req.params });
      const result = await stockService.deleteIngredient(validated.params.id);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error.message === 'Ingredient not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // Transactions
  async createTransaction(req: Request, res: Response) {
    try {
      const transaction = await stockService.createTransaction(req.body);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllTransactions(req: Request, res: Response) {
    try {
      const filters = {
        productId: req.query.productId as string | undefined,
        ingredientId: req.query.ingredientId as string | undefined,
      };
      const transactions = await stockService.getAllTransactions(filters);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await stockService.getTransactionById(id);
      res.json(transaction);
    } catch (error: any) {
      if (error.message === 'Stock transaction not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // Alerts
  async createAlert(req: Request, res: Response) {
    try {
      const alert = await stockService.createAlert(req.body);
      res.status(201).json(alert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllAlerts(req: Request, res: Response) {
    try {
      const filters = {
        productId: req.query.productId as string | undefined,
        ingredientId: req.query.ingredientId as string | undefined,
        isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      };
      const alerts = await stockService.getAllAlerts(filters);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAlertById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const alert = await stockService.getAlertById(id);
      res.json(alert);
    } catch (error: any) {
      if (error.message === 'Stock alert not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async updateAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const alert = await stockService.updateAlert(id, req.body);
      res.json(alert);
    } catch (error: any) {
      if (error.message === 'Stock alert not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async markAlertAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const alert = await stockService.markAlertAsRead(id);
      res.json(alert);
    } catch (error: any) {
      if (error.message === 'Stock alert not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async deleteAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await stockService.deleteAlert(id);
      res.json({ message: 'Stock alert deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Stock alert not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default new StockController();

