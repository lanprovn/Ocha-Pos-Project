import React, { memo } from 'react';
import type { IngredientStock } from '../../../utils/ingredientManagement';

interface IngredientCardProps {
  ingredient: IngredientStock;
  onAddStock: () => void;
  onAdjustStock: () => void;
  onEdit: () => void;
}

export const IngredientCard: React.FC<IngredientCardProps> = memo(({
  ingredient,
  onAddStock,
  onAdjustStock,
  onEdit,
}) => {
  const status =
    ingredient.currentStock === 0
      ? 'out_of_stock'
      : ingredient.currentStock <= ingredient.minStock
        ? 'low_stock'
        : 'in_stock';
  const statusColor =
    status === 'out_of_stock'
      ? 'text-red-600'
      : status === 'low_stock'
        ? 'text-yellow-600'
        : 'text-green-600';
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{ingredient.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Đơn vị: {ingredient.unit}</p>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <div className={statusColor}>
              {status === 'out_of_stock' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : status === 'low_stock' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <button
              onClick={onEdit}
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tồn kho:</span>
            <span className={`font-semibold text-lg ${statusColor}`}>
              {ingredient.currentStock} {ingredient.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Tối thiểu:</span>
            <span className="text-sm">
              {ingredient.minStock} {ingredient.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Tối đa:</span>
            <span className="text-sm">
              {ingredient.maxStock} {ingredient.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Dùng trong:</span>
            <span className="text-sm">{ingredient.usedIn.length} sản phẩm</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onAddStock}
            className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm rounded-md transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nhập</span>
          </button>
          <button
            onClick={onAdjustStock}
            className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded-md transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Điều Chỉnh</span>
          </button>
        </div>
      </div>
    </div>
  );
});

IngredientCard.displayName = 'IngredientCard';

