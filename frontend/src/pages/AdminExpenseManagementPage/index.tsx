import React, { useState, useMemo, useEffect } from 'react';
import { CurrencyDollarIcon, MagnifyingGlassIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useExpenses, useExpenseCategories } from '../../hooks/useExpenses';
import ExpenseFormModal from './ExpenseFormModal';
import ExpenseTable from './ExpenseTable';
import ExpenseFilters from './ExpenseFilters';
import ProfitLossReport from './ProfitLossReport';
import type { Expense, ExpenseType } from '../../types/expense';

const AdminExpenseManagementPage: React.FC = () => {
  const { expenses, isLoading, loadExpenses, createExpense, updateExpense, deleteExpense, getProfitLossReport } = useExpenses();
  const { categories } = useExpenseCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    categoryId?: string;
    type?: ExpenseType;
    startDate?: string;
    endDate?: string;
  }>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.description.toLowerCase().includes(query) ||
          e.category?.name.toLowerCase().includes(query)
      );
    }

    if (filters.categoryId) {
      filtered = filtered.filter((e) => e.categoryId === filters.categoryId);
    }

    if (filters.type) {
      filtered = filtered.filter((e) => e.type === filters.type);
    }

    if (filters.startDate) {
      filtered = filtered.filter((e) => new Date(e.expenseDate) >= new Date(filters.startDate!));
    }

    if (filters.endDate) {
      filtered = filtered.filter((e) => new Date(e.expenseDate) <= new Date(filters.endDate!));
    }

    return filtered;
  }, [expenses, searchQuery, filters]);

  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const byType = filteredExpenses.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseType, number>);

    return {
      total,
      count: filteredExpenses.length,
      byType,
    };
  }, [filteredExpenses]);

  const handleCreate = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi phí này?')) {
      return;
    }
    await deleteExpense(id);
    loadExpenses(filters);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
    loadExpenses(filters);
  };

  const handleViewReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert('Vui lòng chọn khoảng thời gian để xem báo cáo');
      return;
    }
    const report = await getProfitLossReport(filters.startDate, filters.endDate);
    if (report) {
      setReportData(report);
      setShowReport(true);
    }
  };

  useEffect(() => {
    loadExpenses(filters);
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg border-l-4 border-red-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-red-700 mb-3 font-medium uppercase tracking-wide">Tổng Chi Phí</p>
          <p className="text-2xl font-bold text-red-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.total)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Số Lượng</p>
          <p className="text-2xl font-bold text-blue-900">{stats.count}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border-l-4 border-purple-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-purple-700 mb-3 font-medium uppercase tracking-wide">Cố Định</p>
          <p className="text-2xl font-bold text-purple-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.byType.FIXED || 0)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg border-l-4 border-orange-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-orange-700 mb-3 font-medium uppercase tracking-wide">Biến Đổi</p>
          <p className="text-2xl font-bold text-orange-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.byType.VARIABLE || 0)}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chi phí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleViewReport}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Báo Cáo P&L</span>
          </button>

          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm Chi Phí</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <ExpenseFilters
        categories={categories}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Expense Table */}
      <ExpenseTable
        expenses={filteredExpenses}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        mode={editingExpense ? 'edit' : 'create'}
        expense={editingExpense}
        categories={categories}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSuccess={handleFormSuccess}
        onCreate={createExpense}
        onUpdate={updateExpense}
      />

      {/* Profit & Loss Report Modal */}
      {showReport && reportData && (
        <ProfitLossReport
          report={reportData}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default React.memo(AdminExpenseManagementPage);



