import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type {
  Expense,
  ExpenseCategory,
  CreateExpenseInput,
  UpdateExpenseInput,
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
  ExpenseFilters,
  ExpenseSummary,
  ProfitLossReport,
} from '../types/expense';

export const expenseCategoryService = {
  /**
   * Get all expense categories
   */
  async getAll(): Promise<ExpenseCategory[]> {
    return apiClient.get<ExpenseCategory[]>(API_ENDPOINTS.EXPENSE_CATEGORIES);
  },

  /**
   * Get expense category by ID
   */
  async getById(id: string): Promise<ExpenseCategory> {
    return apiClient.get<ExpenseCategory>(API_ENDPOINTS.EXPENSE_CATEGORY_BY_ID(id));
  },

  /**
   * Create expense category
   */
  async create(data: CreateExpenseCategoryInput): Promise<ExpenseCategory> {
    return apiClient.post<ExpenseCategory>(API_ENDPOINTS.EXPENSE_CATEGORIES, data);
  },

  /**
   * Update expense category
   */
  async update(id: string, data: UpdateExpenseCategoryInput): Promise<ExpenseCategory> {
    return apiClient.patch<ExpenseCategory>(API_ENDPOINTS.EXPENSE_CATEGORY_BY_ID(id), data);
  },

  /**
   * Delete expense category
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.EXPENSE_CATEGORY_BY_ID(id));
  },
};

export const expenseService = {
  /**
   * Get all expenses with optional filters
   */
  async getAll(filters?: ExpenseFilters): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.minAmount !== undefined) params.append('minAmount', String(filters.minAmount));
    if (filters?.maxAmount !== undefined) params.append('maxAmount', String(filters.maxAmount));

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.EXPENSES}?${queryString}` : API_ENDPOINTS.EXPENSES;
    return apiClient.get<Expense[]>(url);
  },

  /**
   * Get expense by ID
   */
  async getById(id: string): Promise<Expense> {
    return apiClient.get<Expense>(API_ENDPOINTS.EXPENSE_BY_ID(id));
  },

  /**
   * Create expense
   */
  async create(data: CreateExpenseInput): Promise<Expense> {
    return apiClient.post<Expense>(API_ENDPOINTS.EXPENSES, data);
  },

  /**
   * Update expense
   */
  async update(id: string, data: UpdateExpenseInput): Promise<Expense> {
    return apiClient.patch<Expense>(API_ENDPOINTS.EXPENSE_BY_ID(id), data);
  },

  /**
   * Delete expense
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.EXPENSE_BY_ID(id));
  },

  /**
   * Get expense summary for a date range
   */
  async getSummary(startDate: string, endDate: string): Promise<ExpenseSummary> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    return apiClient.get<ExpenseSummary>(`${API_ENDPOINTS.EXPENSE_SUMMARY}?${params.toString()}`);
  },

  /**
   * Get profit & loss report for a date range
   */
  async getProfitLossReport(startDate: string, endDate: string): Promise<ProfitLossReport> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    return apiClient.get<ProfitLossReport>(`${API_ENDPOINTS.EXPENSE_PROFIT_LOSS}?${params.toString()}`);
  },
};



