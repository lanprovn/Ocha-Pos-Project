/**
 * Utility functions - Re-export all utilities for easier imports
 */

// Format utilities
export {
  formatPrice,
  calculateDiscountedPrice,
  formatRating,
} from './formatPrice';

// Stock management utilities
export {
  getStockStatus,
  getStockStatusColor,
  getStockStatusIcon,
  STOCK_UNITS,
  DEFAULT_STOCK_SETTINGS,
} from './stockManagement';

export type {
  StockUnit,
  StockStatus,
} from './stockManagement';

// Ingredient management utilities
export {
  INGREDIENT_UNITS,
  getIngredientStatus,
  getIngredientStatusColor,
  getIngredientStatusIcon,
} from './ingredientManagement';

export type { IngredientStock, IngredientTransaction, IngredientAlert, IngredientUnit } from './ingredientManagement';

