// Stock filters hook
import { useMemo } from 'react';
import { filterStocks, useProductInfo } from '../utils/stockUtils';
import type { StockProduct, StockTransaction } from '@services/stock.service.ts';
import type { IngredientStock } from '../../../utils/ingredientManagement';
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
    return filterStocks(stocks, filter, categoryFilter, searchQuery, getProductInfo);
  }, [stocks, filter, categoryFilter, searchQuery, getProductInfo]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ingredient) => {
      if (!ingredient || !ingredient.id) return false;

      if (filter === 'low_stock' && !(ingredient.currentStock <= ingredient.minStock && ingredient.currentStock > 0))
        return false;
      if (filter === 'out_of_stock' && ingredient.currentStock !== 0) return false;

      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const matchesName = ingredient.name.toLowerCase().includes(searchLower);
        const matchesId = ingredient.id.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [ingredients, filter, searchQuery]);

  const filteredTransactions = useMemo(() => {
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

