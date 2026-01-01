import { Request, Response } from 'express';
import expenseService from '../services/expense.service';
import { z } from 'zod';
import { ExpenseNotFoundError, ExpenseCategoryNotFoundError } from '../errors/BusinessErrors';
import { ExpenseType } from '../types/expense.types';

const createExpenseCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  }),
});

const updateExpenseCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

const createExpenseSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    amount: z.number().positive(),
    description: z.string().min(1),
    expenseDate: z.string().datetime(),
    type: z.nativeEnum(ExpenseType),
    receiptUrl: z.string().url().optional(),
    notes: z.string().optional(),
  }),
});

const updateExpenseSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid().optional(),
    amount: z.number().positive().optional(),
    description: z.string().min(1).optional(),
    expenseDate: z.string().datetime().optional(),
    type: z.nativeEnum(ExpenseType).optional(),
    receiptUrl: z.string().url().optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export class ExpenseController {
  // ========== Expense Category Methods ==========

  async getAllCategories(_req: Request, res: Response) {
    try {
      const categories = await expenseService.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await expenseService.getCategoryById(id);
      res.json(category);
    } catch (error: any) {
      if (error instanceof ExpenseCategoryNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const validated = createExpenseCategorySchema.parse({ body: req.body });
      const category = await expenseService.createCategory(validated.body);
      res.status(201).json(category);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const validated = updateExpenseCategorySchema.parse({ body: req.body, params: req.params });
      const category = await expenseService.updateCategory(validated.params.id, validated.body);
      res.json(category);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error instanceof ExpenseCategoryNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await expenseService.deleteCategory(id);
      res.json({ message: 'Expense category deleted successfully' });
    } catch (error: any) {
      if (error instanceof ExpenseCategoryNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // ========== Expense Methods ==========

  async getAll(req: Request, res: Response) {
    try {
      const filters: any = {};
      if (req.query.categoryId) {
        filters.categoryId = req.query.categoryId as string;
      }
      if (req.query.type) {
        filters.type = req.query.type as ExpenseType;
      }
      if (req.query.startDate) {
        filters.startDate = req.query.startDate as string;
      }
      if (req.query.endDate) {
        filters.endDate = req.query.endDate as string;
      }
      if (req.query.minAmount) {
        filters.minAmount = parseFloat(req.query.minAmount as string);
      }
      if (req.query.maxAmount) {
        filters.maxAmount = parseFloat(req.query.maxAmount as string);
      }

      const expenses = await expenseService.getAll(filters);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const expense = await expenseService.getById(id);
      res.json(expense);
    } catch (error: any) {
      if (error instanceof ExpenseNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validated = createExpenseSchema.parse({ body: req.body });
      const expense = await expenseService.create(validated.body);
      res.status(201).json(expense);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error instanceof ExpenseCategoryNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const validated = updateExpenseSchema.parse({ body: req.body, params: req.params });
      const expense = await expenseService.update(validated.params.id, validated.body);
      res.json(expense);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else if (error instanceof ExpenseNotFoundError || error instanceof ExpenseCategoryNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await expenseService.delete(id);
      res.json({ message: 'Expense deleted successfully' });
    } catch (error: any) {
      if (error instanceof ExpenseNotFoundError) {
        res.status(404).json({ error: error.message, errorCode: error.errorCode });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async getExpenseSummary(req: Request, res: Response): Promise<Response> {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const summary = await expenseService.getExpenseSummary(startDate, endDate);
      return res.json(summary);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getProfitLossReport(req: Request, res: Response): Promise<Response> {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const report = await expenseService.getProfitLossReport(startDate, endDate);
      return res.json(report);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new ExpenseController();

