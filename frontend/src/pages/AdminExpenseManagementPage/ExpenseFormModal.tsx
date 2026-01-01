import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Expense, ExpenseCategory, CreateExpenseInput, UpdateExpenseInput, ExpenseType } from '../../types/expense';

interface ExpenseFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  expense?: Expense | null;
  categories: ExpenseCategory[];
  onClose: () => void;
  onSuccess: () => void;
  onCreate: (data: CreateExpenseInput) => Promise<Expense | null>;
  onUpdate: (id: string, data: UpdateExpenseInput) => Promise<Expense | null>;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  mode,
  expense,
  categories,
  onClose,
  onSuccess,
  onCreate,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    type: 'VARIABLE' as ExpenseType,
    receiptUrl: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && expense) {
        setFormData({
          categoryId: expense.categoryId,
          amount: expense.amount.toString(),
          description: expense.description,
          expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
          type: expense.type,
          receiptUrl: expense.receiptUrl || '',
          notes: expense.notes || '',
        });
      } else {
        setFormData({
          categoryId: categories.length > 0 ? categories[0].id : '',
          amount: '',
          description: '',
          expenseDate: new Date().toISOString().split('T')[0],
          type: 'VARIABLE',
          receiptUrl: '',
          notes: '',
        });
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, mode, expense, categories]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.categoryId) {
      setError('Vui lòng chọn danh mục');
      return;
    }
    if (!formData.description.trim()) {
      setError('Mô tả không được để trống');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        const createData: CreateExpenseInput = {
          categoryId: formData.categoryId,
          amount: parseFloat(formData.amount),
          description: formData.description.trim(),
          expenseDate: new Date(formData.expenseDate).toISOString(),
          type: formData.type,
          receiptUrl: formData.receiptUrl.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        };
        await onCreate(createData);
      } else if (expense) {
        const updateData: UpdateExpenseInput = {
          categoryId: formData.categoryId,
          amount: parseFloat(formData.amount),
          description: formData.description.trim(),
          expenseDate: new Date(formData.expenseDate).toISOString(),
          type: formData.type,
          receiptUrl: formData.receiptUrl.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        };
        await onUpdate(expense.id, updateData);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Không thể lưu chi phí');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">
                {mode === 'create' ? 'Thêm Chi Phí' : 'Sửa Chi Phí'}
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loại chi phí <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="FIXED">Cố định</option>
                    <option value="VARIABLE">Biến đổi</option>
                    <option value="ONE_TIME">Một lần</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Số tiền (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày chi phí <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL hóa đơn
                </label>
                <input
                  type="url"
                  name="receiptUrl"
                  value={formData.receiptUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFormModal;



