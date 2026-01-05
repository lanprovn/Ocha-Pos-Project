import React, { useEffect, useState } from 'react';
import { INGREDIENT_UNITS } from '@utils/ingredientManagement';

export interface IngredientFormValues {
  ingredientId?: string;
  stockId?: string;
  name: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  isActive: boolean;
}

interface IngredientFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<IngredientFormValues>;
  onClose: () => void;
  onSubmit: (values: IngredientFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
}

const IngredientFormModal: React.FC<IngredientFormModalProps> = ({
  isOpen,
  mode,
  initialValues,
  onClose,
  onSubmit,
  onDelete,
  loading,
}) => {
  const [formState, setFormState] = useState<{
    name: string;
    unit: string;
    quantity: string;
    minStock: string;
    maxStock: string;
    isActive: boolean;
  }>({
    name: '',
    unit: INGREDIENT_UNITS[0],
    quantity: '',
    minStock: '',
    maxStock: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormState({
      name: initialValues?.name || '',
      unit: initialValues?.unit || INGREDIENT_UNITS[0],
      quantity:
        initialValues?.quantity !== undefined
          ? String(initialValues.quantity)
          : '',
      minStock:
        initialValues?.minStock !== undefined
          ? String(initialValues.minStock)
          : '',
      maxStock:
        initialValues?.maxStock !== undefined
          ? String(initialValues.maxStock)
          : '',
      isActive:
        initialValues?.isActive !== undefined
          ? initialValues.isActive
          : true,
    });
    setError(null);
    setIsSubmitting(false);
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formState.name.trim()) {
      setError('Tên nguyên liệu không được để trống');
      return;
    }

    const quantity = parseInt(formState.quantity || '0', 10);
    const minStock = parseInt(formState.minStock || '0', 10);
    const maxStock = parseInt(formState.maxStock || '0', 10);

    if (Number.isNaN(quantity) || quantity < 0) {
      setError('Số lượng tồn kho không hợp lệ');
      return;
    }

    if (Number.isNaN(minStock) || minStock < 0) {
      setError('Tồn kho tối thiểu không hợp lệ');
      return;
    }

    if (Number.isNaN(maxStock) || maxStock < 0) {
      setError('Tồn kho tối đa không hợp lệ');
      return;
    }

    if (maxStock > 0 && quantity > maxStock) {
      setError('Số lượng hiện tại không được vượt quá tồn kho tối đa');
      return;
    }

    if (minStock > maxStock && maxStock !== 0) {
      setError('Tồn kho tối thiểu không được lớn hơn tồn kho tối đa');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ingredientId: initialValues?.ingredientId,
        stockId: initialValues?.stockId,
        name: formState.name.trim(),
        unit: formState.unit,
        quantity,
        minStock,
        maxStock,
        isActive: formState.isActive,
      });
    } catch (err: any) {
      setError(err?.message || 'Không thể lưu nguyên liệu');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsSubmitting(true);
    try {
      await onDelete();
    } catch (err: any) {
      setError(err?.message || 'Không thể xóa nguyên liệu');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full md:w-[90%] lg:w-[80%] mx-auto border border-white/50 transform animate-scale-in space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Thêm Nguyên Liệu' : 'Cập Nhật Nguyên Liệu'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Tên nguyên liệu
            </label>
            <input
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ví dụ: Trân châu đen"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Đơn vị
            </label>
            <select
              name="unit"
              value={formState.unit}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {INGREDIENT_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Số lượng ban đầu
              </label>
              <input
                name="quantity"
                type="number"
                min="0"
                value={formState.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ví dụ: 1000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Tồn kho tối thiểu
              </label>
              <input
                name="minStock"
                type="number"
                min="0"
                value={formState.minStock}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ví dụ: 100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Tồn kho tối đa
              </label>
              <input
                name="maxStock"
                type="number"
                min="0"
                value={formState.maxStock}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ví dụ: 5000"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                checked={formState.isActive}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span>Kích hoạt nguyên liệu</span>
            </label>
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                disabled={loading || isSubmitting}
              >
                Xóa nguyên liệu
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mode === 'create' ? 'Thêm nguyên liệu' : 'Lưu thay đổi'}
            </button>
          </div>

          <style>{`
            @keyframes scale-in {
              from {
                transform: scale(0.9);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-scale-in {
              animation: scale-in 0.25s ease-out;
            }
          `}</style>
        </form>
      </div>
    </>
  );
};

export default IngredientFormModal;

