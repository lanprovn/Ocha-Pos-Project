import React from 'react';
import { SearchBar } from '@components/ui/SearchBar';
import { EmptyState } from '@components/ui/EmptyState';
import { IngredientCard } from './IngredientCard';
import { FilterButtons } from './FilterButtons';
import type { IngredientStock } from '@/utils/ingredientManagement';
import type { StockProduct } from '@features/stock/services/stock.service';
import type { StockFilter } from '../types';

interface IngredientsTabProps {
  filteredIngredients?: IngredientStock[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filter: StockFilter;
  setFilter: (filter: StockFilter) => void;
  ingredientStats?: {
    lowStock: number;
    outOfStock: number;
    total?: number;
  };
  onOpenAdjustModal: (product?: StockProduct, ingredient?: IngredientStock, adjustMode?: boolean) => void;
  onCreateIngredient: () => void;
  onEditIngredient: (ingredient: IngredientStock) => void;
}

export const IngredientsTab: React.FC<IngredientsTabProps> = ({
  filteredIngredients,
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  ingredientStats,
  onOpenAdjustModal,
  onCreateIngredient,
  onEditIngredient,
}) => {
  // Provide default values to prevent undefined errors
  const stats = ingredientStats || { lowStock: 0, outOfStock: 0 };
  const safeFilteredIngredients = filteredIngredients || [];

  // Debug logging removed for production

  return (
    <div>
      <div className="mb-6 space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm kiếm nguyên liệu theo tên hoặc ID..."
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <FilterButtons
            filter={filter}
            setFilter={setFilter}
            lowStockCount={stats.lowStock}
            outOfStockCount={stats.outOfStock}
            showCategoryFilter={false}
          />
          <button
            onClick={onCreateIngredient}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            ➕
            <span>Thêm nguyên liệu</span>
          </button>
        </div>
      </div>

      {safeFilteredIngredients.length === 0 && (
        <EmptyState
          icon="🥛"
          title={
            searchQuery || filter !== 'all'
              ? 'Không tìm thấy nguyên liệu'
              : 'Chưa có nguyên liệu nào'
          }
          message={
            searchQuery || filter !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bắt đầu bằng cách thêm nguyên liệu vào hệ thống'
          }
          showClearButton={Boolean(searchQuery) || filter !== 'all'}
          onClear={() => {
            setSearchQuery('');
            setFilter('all');
          }}
        />
      )}

      {safeFilteredIngredients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeFilteredIngredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onAddStock={() => onOpenAdjustModal(undefined, ingredient)}
              onAdjustStock={() => onOpenAdjustModal(undefined, ingredient, true)}
              onEdit={() => onEditIngredient(ingredient)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

