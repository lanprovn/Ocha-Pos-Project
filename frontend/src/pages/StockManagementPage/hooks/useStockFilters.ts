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
    return filterStocks(stocks || [], filter, categoryFilter, searchQuery, getProductInfo);
  }, [stocks, filter, categoryFilter, searchQuery, getProductInfo]);

  const filteredIngredients = useMemo(() => {
    if (!ingredients || !Array.isArray(ingredients)) {
      console.log('⚠️ filteredIngredients: ingredients is not an array', ingredients);
      return [];
    }
    
    console.log('🔍 Filtering ingredients:', {
      totalIngredients: ingredients.length,
      filter: filter,
      searchQuery: searchQuery,
      firstIngredient: ingredients[0], // Log first ingredient for debugging
      sampleIngredients: ingredients.slice(0, 3).map(ing => ({
        id: ing.id,
        name: ing.name,
        currentStock: ing.currentStock,
        minStock: ing.minStock,
      })),
    });
    
    const filtered = ingredients.filter((ingredient) => {
      if (!ingredient || !ingredient.id) {
        console.warn('⚠️ Invalid ingredient:', ingredient);
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
    
    console.log('✅ Filtered ingredients result:', {
      filteredCount: filtered.length,
      filter: filter,
      searchQuery: searchQuery,
      sampleFiltered: filtered.slice(0, 3).map(ing => ({
        id: ing.id,
        name: ing.name,
        currentStock: ing.currentStock,
        minStock: ing.minStock,
      })),
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

