import React, { useEffect, useMemo, useState } from 'react';
import RecipeManager from './RecipeManager';

interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductFormValues {
  productId?: string;
  stockId?: string;
  name: string;
  price: number;
  categoryId?: string;
  description?: string;
  image?: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  isActive: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  categories: CategoryOption[];
  initialValues?: Partial<ProductFormValues>;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const DEFAULT_UNITS = ['cái', 'ly', 'kg', 'gói', 'chai', 'hộp', 'túi', 'ml', 'lít'];

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  categories,
  initialValues,
  loading,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const defaultCategoryId = useMemo(() => {
    if (initialValues?.categoryId) return initialValues.categoryId;
    if (Array.isArray(categories) && categories.length > 0) return String(categories[0].id);
    return '';
  }, [categories, initialValues]);

  const [formState, setFormState] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    image: '',
    unit: 'cái',
    quantity: '',
    minStock: '',
    maxStock: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormState({
        name: initialValues?.name || '',
        price:
          initialValues?.price !== undefined
            ? String(initialValues.price)
            : '',
        categoryId: initialValues?.categoryId || defaultCategoryId,
        description: initialValues?.description || '',
        image: initialValues?.image || '',
        unit: initialValues?.unit || 'cái',
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
    }
  }, [isOpen, initialValues, defaultCategoryId]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const price = parseFloat(formState.price || '0');
    const quantity = parseInt(formState.quantity || '0', 10);
    const minStock = parseInt(formState.minStock || '0', 10);
    const maxStock = parseInt(formState.maxStock || '0', 10);

    if (!formState.name.trim()) {
      setError('Tên sản phẩm không được để trống');
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setError('Giá sản phẩm không hợp lệ');
      return;
    }

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
        productId: initialValues?.productId,
        stockId: initialValues?.stockId,
        name: formState.name.trim(),
        price,
        categoryId: formState.categoryId || undefined,
        description: formState.description?.trim() || undefined,
        image: formState.image?.trim() || undefined,
        unit: formState.unit.trim() || 'cái',
        quantity,
        minStock,
        maxStock,
        isActive: formState.isActive,
      });
    } catch (err: any) {
      setError(err?.message || 'Không thể lưu sản phẩm');
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
      setError(err?.message || 'Không thể xóa sản phẩm');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] lg:h-[80vh] flex flex-col overflow-hidden transform animate-scale-in"
        >
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Thêm Sản Phẩm Mới' : 'Cập Nhật Sản Phẩm'}
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

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tên sản phẩm
                </label>
                <input
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Giá bán (VNĐ)
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formState.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ví dụ: 38000"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Danh mục
                </label>
                <select
                  name="categoryId"
                  value={formState.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Không phân loại</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Đơn vị
                </label>
                <select
                  name="unit"
                  value={formState.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {DEFAULT_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

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
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ví dụ: 50"
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
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ví dụ: 10"
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
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ví dụ: 200"
                />
              </div>

              <div className="lg:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formState.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ghi chú thêm về sản phẩm..."
                  rows={3}
                />
              </div>

              <div className="lg:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Hình ảnh (URL)
                </label>
                <input
                  name="image"
                  value={formState.image}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://..."
                />
              </div>

              {/* Recipe Manager */}
              <div className="lg:col-span-2 mt-4 pt-4 border-t border-gray-200">
                <RecipeManager
                  productId={initialValues?.productId}
                  mode={mode}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                checked={formState.isActive}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span>Kích hoạt sản phẩm</span>
            </label>
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                disabled={loading || isSubmitting}
              >
                Xóa sản phẩm
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
              {mode === 'create' ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
            </button>
          </div>

          <style>{`
            @keyframes scale-in {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-scale-in {
              animation: scale-in 0.2s ease-out;
            }
          `}</style>
        </form>
      </div>
    </>
  );
};

export default ProductFormModal;


