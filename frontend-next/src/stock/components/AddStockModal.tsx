"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useProducts } from '@features/products/hooks/useProducts';
import stockService from '@features/stock/services/stock.service';
import type { Product } from '@/types/product';
import type { StockProduct } from '@features/stock/services/stock.service';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productId: string, stockData: StockFormData) => Promise<void>;
  existingStocks: StockProduct[];
  loading?: boolean;
}

export interface StockFormData {
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  isActive: boolean;
}

const DEFAULT_UNITS = ['cái', 'ly', 'kg', 'gói', 'chai', 'hộp', 'túi', 'ml', 'lít'];

const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingStocks,
  loading = false,
}) => {
  const { products, loadProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [formData, setFormData] = useState<StockFormData>({
    quantity: 0,
    minStock: 0,
    maxStock: 100,
    unit: 'cái',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load products on mount
  useEffect(() => {
    if (isOpen && products.length === 0) {
      loadProducts();
    }
  }, [isOpen, products.length, loadProducts]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedProductId('');
      setFormData({
        quantity: 0,
        minStock: 0,
        maxStock: 100,
        unit: 'cái',
        isActive: true,
      });
      setSearchQuery('');
      setError(null);
    }
  }, [isOpen]);

  // Get products that don't have stock yet
  const availableProducts = useMemo(() => {
    const stockProductIds = new Set(existingStocks.map((s) => s.productId));
    return products.filter((p) => !stockProductIds.has(String(p.id)));
  }, [products, existingStocks]);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return availableProducts;
    const query = searchQuery.toLowerCase();
    return availableProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
    );
  }, [availableProducts, searchQuery]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => String(p.id) === selectedProductId);
  }, [products, selectedProductId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'isActive' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProductId) {
      setError('Vui lòng chọn sản phẩm');
      return;
    }

    if (formData.minStock < 0) {
      setError('Tồn kho tối thiểu không được âm');
      return;
    }

    if (formData.maxStock < formData.minStock) {
      setError('Tồn kho tối đa phải lớn hơn hoặc bằng tồn kho tối thiểu');
      return;
    }

    if (formData.quantity < 0) {
      setError('Số lượng tồn kho không được âm');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(selectedProductId, formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể thêm tồn kho');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Thêm Tồn Kho Cho Sản Phẩm</h2>
            <p className="mt-1 text-sm text-gray-500">
              Chọn sản phẩm từ menu và thiết lập thông tin tồn kho
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm sản phẩm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên sản phẩm để tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Product Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn sản phẩm <span className="text-red-500">*</span>
            </label>
            {filteredProducts.length === 0 ? (
              <div className="border border-gray-300 rounded-lg p-8 text-center text-gray-500">
                {availableProducts.length === 0 ? (
                  <div>
                    <p className="font-medium mb-2">Tất cả sản phẩm đã có tồn kho</p>
                    <p className="text-sm">
                      Vui lòng tạo sản phẩm mới trong{' '}
                      <span className="font-semibold text-orange-600">Quản lý Menu</span> trước
                    </p>
                  </div>
                ) : (
                  <p>Không tìm thấy sản phẩm phù hợp</p>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProductId(String(product.id))}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0 ${
                      selectedProductId === String(product.id) ? 'bg-orange-50 border-orange-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.category && (
                          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                        )}
                      </div>
                      {selectedProductId === String(product.id) && (
                        <div className="ml-4 text-orange-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Sản phẩm đã chọn:</p>
              <p className="text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
              {selectedProduct.price && (
                <p className="text-sm text-gray-600 mt-1">
                  Giá: {new Intl.NumberFormat('vi-VN').format(selectedProduct.price)} đ
                </p>
              )}
            </div>
          )}

          {/* Stock Form */}
          {selectedProductId && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng hiện tại
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn vị tính
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {DEFAULT_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tồn kho tối thiểu
                  </label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tồn kho tối đa
                  </label>
                  <input
                    type="number"
                    name="maxStock"
                    value={formData.maxStock}
                    onChange={handleNumberChange}
                    min={formData.minStock}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label className="ml-2 text-sm text-gray-700">Kích hoạt tồn kho</label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedProductId || isSubmitting || loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang lưu...' : 'Thêm Tồn Kho'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;
