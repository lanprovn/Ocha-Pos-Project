import React from 'react';
import type { StockFilter } from '../types';

interface FilterButtonsProps {
  filter: StockFilter;
  setFilter: (filter: StockFilter) => void;
  categoryFilter?: string;
  setCategoryFilter?: (value: string) => void;
  lowStockCount?: number;
  outOfStockCount?: number;
  getCategories?: () => string[];
  showCategoryFilter?: boolean;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  filter,
  setFilter,
  categoryFilter,
  setCategoryFilter,
  lowStockCount = 0,
  outOfStockCount = 0,
  getCategories,
  showCategoryFilter = true,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => setFilter('all')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          filter === 'all'
            ? 'bg-indigo-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Tất Cả
      </button>
      <button
        onClick={() => setFilter('low_stock')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          filter === 'low_stock'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Sắp Hết {lowStockCount > 0 && `(${lowStockCount})`}
      </button>
      <button
        onClick={() => setFilter('out_of_stock')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          filter === 'out_of_stock'
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Hết Hàng {outOfStockCount > 0 && `(${outOfStockCount})`}
      </button>

      {showCategoryFilter && getCategories && categoryFilter !== undefined && setCategoryFilter && getCategories().length > 0 && (
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">Tất cả danh mục</option>
          {getCategories().map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

