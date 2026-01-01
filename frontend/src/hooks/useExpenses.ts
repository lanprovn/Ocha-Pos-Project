import { useState, useEffect, useCallback } from 'react';
import { expenseService, expenseCategoryService } from '../services/expense.service';
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
import toast from 'react-hot-toast';

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await expenseCategoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh mục chi phí');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CreateExpenseCategoryInput): Promise<ExpenseCategory | null> => {
    try {
      const newCategory = await expenseCategoryService.create(data);
      setCategories((prev) => [newCategory, ...prev]);
      toast.success('Đã tạo danh mục thành công');
      return newCategory;
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo danh mục');
      return null;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: UpdateExpenseCategoryInput): Promise<ExpenseCategory | null> => {
    try {
      const updated = await expenseCategoryService.update(id, data);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success('Đã cập nhật danh mục thành công');
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật danh mục');
      return null;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      await expenseCategoryService.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Đã xóa danh mục thành công');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa danh mục');
      return false;
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async (filters?: ExpenseFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expenseService.getAll(filters);
      setExpenses(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải danh sách chi phí';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExpense = useCallback(async (data: CreateExpenseInput): Promise<Expense | null> => {
    try {
      const newExpense = await expenseService.create(data);
      setExpenses((prev) => [newExpense, ...prev]);
      toast.success('Đã tạo chi phí thành công');
      return newExpense;
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo chi phí');
      return null;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, data: UpdateExpenseInput): Promise<Expense | null> => {
    try {
      const updated = await expenseService.update(id, data);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      toast.success('Đã cập nhật chi phí thành công');
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật chi phí');
      return null;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    try {
      await expenseService.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success('Đã xóa chi phí thành công');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa chi phí');
      return false;
    }
  }, []);

  const getSummary = useCallback(async (startDate: string, endDate: string): Promise<ExpenseSummary | null> => {
    try {
      return await expenseService.getSummary(startDate, endDate);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải tổng hợp chi phí');
      return null;
    }
  }, []);

  const getProfitLossReport = useCallback(async (startDate: string, endDate: string): Promise<ProfitLossReport | null> => {
    try {
      return await expenseService.getProfitLossReport(startDate, endDate);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải báo cáo P&L');
      return null;
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    isLoading,
    error,
    loadExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getSummary,
    getProfitLossReport,
  };
};



