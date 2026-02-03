"use client";
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updates: { price?: number; stock?: number }) => void;
  selectedCount: number;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedCount,
}) => {
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { price?: number; stock?: number } = {};
    if (price) {
      const priceNum = Number(price);
      if (priceNum > 0) {
        updates.price = priceNum;
      }
    }
    if (stock !== '') {
      const stockNum = Number(stock);
      if (stockNum >= 0) {
        updates.stock = stockNum;
      }
    }
    if (Object.keys(updates).length === 0) {
      return;
    }
    onSubmit(updates);
    setPrice('');
    setStock('');
  };

  const handleClose = () => {
    setPrice('');
    setStock('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Sửa hàng loạt ({selectedCount} sản phẩm)
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá mới (để trống nếu không muốn thay đổi)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Nhập giá mới"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tồn kho mới (để trống nếu không muốn thay đổi)
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Nhập tồn kho mới"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkEditModal;




