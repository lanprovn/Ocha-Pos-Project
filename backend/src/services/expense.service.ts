import prisma from '../config/database';
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
  ExpenseSummary,
  ProfitLossReport,
  ExpenseType,
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
} from '../types/expense.types';
import { ExpenseNotFoundError, ExpenseCategoryNotFoundError } from '../errors/BusinessErrors';
import { Decimal } from '@prisma/client/runtime/library';

export class ExpenseService {
  // ========== Expense Category Methods ==========

  /**
   * Get all expense categories
   */
  async getAllCategories() {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }

  /**
   * Get expense category by ID
   */
  async getCategoryById(id: string) {
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        expenses: {
          take: 10,
          orderBy: {
            expenseDate: 'desc',
          },
        },
      },
    });

    if (!category) {
      throw new ExpenseCategoryNotFoundError(id);
    }

    return category;
  }

  /**
   * Create expense category
   */
  async createCategory(data: CreateExpenseCategoryInput) {
    const category = await prisma.expenseCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return category;
  }

  /**
   * Update expense category
   */
  async updateCategory(id: string, data: UpdateExpenseCategoryInput) {
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new ExpenseCategoryNotFoundError(id);
    }

    const updated = await prisma.expenseCategory.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return updated;
  }

  /**
   * Delete expense category
   */
  async deleteCategory(id: string) {
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new ExpenseCategoryNotFoundError(id);
    }

    // Check if category has expenses
    const expenseCount = await prisma.expense.count({
      where: { categoryId: id },
    });

    if (expenseCount > 0) {
      throw new Error('Không thể xóa danh mục đang có chi phí');
    }

    await prisma.expenseCategory.delete({
      where: { id },
    });

    return { message: 'Expense category deleted successfully' };
  }

  // ========== Expense Methods ==========

  /**
   * Get all expenses with optional filters
   */
  async getAll(filters?: ExpenseFilters) {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      where.expenseDate = {};
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        where.expenseDate.gte = startDate;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.expenseDate.lte = endDate;
      }
    }

    if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) {
        where.amount.gte = new Decimal(filters.minAmount);
      }
      if (filters.maxAmount !== undefined) {
        where.amount.lte = new Decimal(filters.maxAmount);
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    return expenses;
  }

  /**
   * Get expense by ID
   */
  async getById(id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!expense) {
      throw new ExpenseNotFoundError(id);
    }

    return expense;
  }

  /**
   * Create expense
   */
  async create(data: CreateExpenseInput) {
    // Verify category exists
    const category = await prisma.expenseCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new ExpenseCategoryNotFoundError(data.categoryId);
    }

    const expense = await prisma.expense.create({
      data: {
        categoryId: data.categoryId,
        amount: new Decimal(data.amount),
        description: data.description,
        expenseDate: new Date(data.expenseDate),
        type: data.type,
        receiptUrl: data.receiptUrl,
        notes: data.notes,
      },
      include: {
        category: true,
      },
    });

    return expense;
  }

  /**
   * Update expense
   */
  async update(id: string, data: UpdateExpenseInput) {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new ExpenseNotFoundError(id);
    }

    const updateData: any = {};

    if (data.categoryId) {
      // Verify category exists
      const category = await prisma.expenseCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new ExpenseCategoryNotFoundError(data.categoryId);
      }

      updateData.categoryId = data.categoryId;
    }

    if (data.amount !== undefined) {
      updateData.amount = new Decimal(data.amount);
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.expenseDate !== undefined) {
      updateData.expenseDate = new Date(data.expenseDate);
    }

    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    if (data.receiptUrl !== undefined) {
      updateData.receiptUrl = data.receiptUrl;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return updated;
  }

  /**
   * Delete expense
   */
  async delete(id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new ExpenseNotFoundError(id);
    }

    await prisma.expense.delete({
      where: { id },
    });

    return { message: 'Expense deleted successfully' };
  }

  /**
   * Get expense summary for a date range
   */
  async getExpenseSummary(startDate: Date | string, endDate: Date | string): Promise<ExpenseSummary> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
      },
    });

    let totalAmount = 0;
    const byCategoryMap: Record<string, { categoryId: string; categoryName: string; totalAmount: number; count: number }> = {};
    const byTypeMap: Record<ExpenseType, { type: ExpenseType; totalAmount: number; count: number }> = {
      [ExpenseType.FIXED]: { type: ExpenseType.FIXED, totalAmount: 0, count: 0 },
      [ExpenseType.VARIABLE]: { type: ExpenseType.VARIABLE, totalAmount: 0, count: 0 },
      [ExpenseType.ONE_TIME]: { type: ExpenseType.ONE_TIME, totalAmount: 0, count: 0 },
    };

    expenses.forEach((expense) => {
      const amount = parseFloat(expense.amount.toString());
      totalAmount += amount;

      // By category
      const categoryId = expense.categoryId;
      const categoryName = expense.category.name;
      if (!byCategoryMap[categoryId]) {
        byCategoryMap[categoryId] = {
          categoryId,
          categoryName,
          totalAmount: 0,
          count: 0,
        };
      }
      byCategoryMap[categoryId].totalAmount += amount;
      byCategoryMap[categoryId].count += 1;

      // By type
      byTypeMap[expense.type].totalAmount += amount;
      byTypeMap[expense.type].count += 1;
    });

    return {
      totalAmount,
      count: expenses.length,
      byCategory: Object.values(byCategoryMap),
      byType: Object.values(byTypeMap),
    };
  }

  /**
   * Get profit & loss report
   */
  async getProfitLossReport(startDate: Date | string, endDate: Date | string): Promise<ProfitLossReport> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get revenue from orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          not: 'CANCELLED',
        },
        paymentStatus: 'SUCCESS',
      },
    });

    const revenue = orders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount.toString());
    }, 0);

    // Get expenses
    const expenseSummary = await this.getExpenseSummary(start, end);

    const expenses = expenseSummary.totalAmount;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      expenses,
      profit,
      profitMargin,
      period: {
        startDate: start,
        endDate: end,
      },
      expenseBreakdown: expenseSummary,
    };
  }
}

export default new ExpenseService();



