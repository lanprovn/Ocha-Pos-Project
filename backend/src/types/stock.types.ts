/**
 * Re-export stock types from shared-types package
 * This ensures type consistency between Frontend and Backend
 */
export type {
  UpdateStockProductInput,
  UpdateStockIngredientInput,
  CreateStockTransactionInput,
  CreateStockAlertInput,
  UpdateStockAlertInput,
  StockFilters,
  CreateProductStockInput,
  CreateIngredientInput,
  UpdateIngredientInput,
  Stock,
  Ingredient,
  IngredientStock,
  StockTransaction,
  StockAlert,
} from '@ocha-pos/shared-types';

