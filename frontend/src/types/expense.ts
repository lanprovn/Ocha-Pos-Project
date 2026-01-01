export enum ExpenseType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
  ONE_TIME = 'ONE_TIME',
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateExpenseCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateExpenseCategoryInput {
  name?: string;
  description?: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  expenseDate: string;
  type: ExpenseType;
  receiptUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  category?: ExpenseCategory;
}

export interface CreateExpenseInput {
  categoryId: string;
  amount: number;
  description: string;
  expenseDate: string;
  type: ExpenseType;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateExpenseInput {
  categoryId?: string;
  amount?: number;
  description?: string;
  expenseDate?: string;
  type?: ExpenseType;
  receiptUrl?: string;
  notes?: string;
}

export interface ExpenseFilters {
  categoryId?: string;
  type?: ExpenseType;
  startDate?: string;
  endDate?: string;
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
    startDate: string;
    endDate: string;
  };
  expenseBreakdown: ExpenseSummary;
}



