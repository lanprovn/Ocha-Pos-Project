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
  const statusIcon = status === 'out_of_stock' ? '❌' : status === 'low_stock' ? '⚠️' : '✅';

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
      style={{
        willChange: 'box-shadow',
        transition: 'box-shadow 0.3s ease-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{ingredient.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Đơn vị: {ingredient.unit}</p>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <span className={`text-lg ${statusColor}`}>{statusIcon}</span>
            <button
              onClick={onEdit}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
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
            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded"
            style={{
              willChange: 'background-color',
              transition: 'background-color 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(37 99 235)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            ➕ Nhập
          </button>
          <button
            onClick={onAdjustStock}
            className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded"
            style={{
              willChange: 'background-color',
              transition: 'background-color 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(75 85 99)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            ✏️ Điều Chỉnh
          </button>
        </div>
      </div>
    </div>
  );
});

IngredientCard.displayName = 'IngredientCard';

