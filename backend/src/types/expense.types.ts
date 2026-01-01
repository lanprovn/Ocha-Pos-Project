/**
 * Expense related types
 */

import { Timestamped } from './common.types';

// ===== Enums =====
export enum ExpenseType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
  ONE_TIME = 'ONE_TIME',
}

// ===== Expense Category Types =====
export interface ExpenseCategory extends Timestamped {
  id: string;
  name: string;
  description?: string | null;
}

export interface CreateExpenseCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateExpenseCategoryInput {
  name?: string;
  description?: string;
}

// ===== Expense Types =====
export interface Expense extends Timestamped {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  expenseDate: Date | string;
  type: ExpenseType;
  receiptUrl?: string | null;
  notes?: string | null;
  category?: ExpenseCategory;
}

export interface CreateExpenseInput {
  categoryId: string;
  amount: number;
  description: string;
  expenseDate: Date | string;
  type: ExpenseType;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateExpenseInput {
  categoryId?: string;
  amount?: number;
  description?: string;
  expenseDate?: Date | string;
  type?: ExpenseType;
  receiptUrl?: string;
  notes?: string;
}

export interface ExpenseFilters {
  categoryId?: string;
  type?: ExpenseType;
  startDate?: Date | string;
  endDate?: Date | string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseSummary {
  totalAmount: number;
  count: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    count: number;
  }>;
  byType: Array<{
    type: ExpenseType;
    totalAmount: number;
    count: number;
  }>;
}

export interface ProfitLossReport {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  period: {
    startDate: Date | string;
    endDate: Date | string;
  };
  expenseBreakdown: ExpenseSummary;
}



