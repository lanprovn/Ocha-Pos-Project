import React from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { Expense } from '../../types/expense';

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, isLoading, onEdit, onDelete }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FIXED: 'Cố định',
      VARIABLE: 'Biến đổi',
      ONE_TIME: 'Một lần',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      FIXED: 'bg-purple-100 text-purple-800 border-purple-300',
      VARIABLE: 'bg-orange-100 text-orange-800 border-orange-300',
      ONE_TIME: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[type] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Mô Tả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Danh Mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Số Tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Ngày
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-sm">Chưa có chi phí nào</p>
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{expense.description}</div>
                    {expense.notes && (
                      <div className="text-sm text-slate-500">{expense.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{expense.category?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(expense.type)}`}
                    >
                      {getTypeLabel(expense.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(expense.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(expense.expenseDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;



