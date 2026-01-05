// Stock filters hook
import { useMemo } from 'react';
import { filterStocks, useProductInfo } from '../utils/stockUtils';
import type { StockProduct, StockTransaction } from '@features/stock/services/stock.service';
import type { IngredientStock } from '@/utils/ingredientManagement';
import type { StockFilter } from '../types';

export const useStockFilters = (
  stocks: StockProduct[],
  transactions: StockTransaction[],
  ingredients: IngredientStock[],
  filter: StockFilter,
  categoryFilter: string,
  searchQuery: string
) => {
  const { getProductInfo, getCategories } = useProductInfo();

  const filteredStocks = useMemo(() => {
    return filterStocks(stocks || [], filter, categoryFilter, searchQuery, getProductInfo);
  }, [stocks, filter, categoryFilter, searchQuery, getProductInfo]);

  const filteredIngredients = useMemo(() => {
    if (!ingredients || !Array.isArray(ingredients)) {
      return [];
    }
    
    const filtered = ingredients.filter((ingredient) => {
      if (!ingredient || !ingredient.id) {
        // Invalid ingredient - skip
        return false;
      }

      // Filter by stock status
      if (filter === 'low_stock') {
        const isLowStock = ingredient.currentStock <= ingredient.minStock && ingredient.currentStock > 0;
        if (!isLowStock) return false;
      }
      if (filter === 'out_of_stock') {
        if (ingredient.currentStock !== 0) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const matchesName = ingredient.name?.toLowerCase().includes(searchLower);
        const matchesId = ingredient.id?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
    
    return filtered;
  }, [ingredients, filter, searchQuery]);

  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    return transactions.filter((transaction) => {
      if (!transaction || !transaction.productId) return false;

      if (searchQuery.trim()) {
        const productInfo = getProductInfo(transaction.productId);
        const searchLower = searchQuery.toLowerCase();
        const matchesName = productInfo?.name.toLowerCase().includes(searchLower);
        const matchesId = transaction.productId.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, getProductInfo]);

  return {
    filteredStocks,
    filteredIngredients,
    filteredTransactions,
    getCategories,
    getProductInfo,
  };
};

