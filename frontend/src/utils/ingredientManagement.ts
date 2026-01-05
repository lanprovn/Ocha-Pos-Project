// Ingredient management types and interfaces
export interface IngredientStock {
  id: string;
  stockId?: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  usedIn: string[];
  lastUpdated: number;
  isActive: boolean;
}

export interface IngredientTransaction {
  id: string;
  ingredientId: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'return';
  quantity: number;
  reason?: string;
  timestamp: number;
  userId?: string;
}

export interface IngredientAlert {
  id: string;
  ingredientId: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
  message: string;
  timestamp: number;
  isRead: boolean;
}

export const INGREDIENT_UNITS = [
  'ml',
  'g',
  'kg',
  'lít',
  'cái',
  'bịch',
  'gói',
  'hộp',
  'chai',
  'lon',
  'túi',
  'miếng',
  'phần',
  'muỗng',
  'thìa',
] as const;

export type IngredientUnit = typeof INGREDIENT_UNITS[number];

export const getIngredientStatus = (ingredient: IngredientStock): 'in_stock' | 'low_stock' | 'out_of_stock' => {
  if (ingredient.currentStock === 0) return 'out_of_stock';
  if (ingredient.currentStock <= ingredient.minStock) return 'low_stock';
  return 'in_stock';
};

export const getIngredientStatusColor = (status: 'in_stock' | 'low_stock' | 'out_of_stock'): string => {
  switch (status) {
    case 'in_stock':
      return 'text-green-600';
    case 'low_stock':
      return 'text-yellow-600';
    case 'out_of_stock':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getIngredientStatusIcon = (status: 'in_stock' | 'low_stock' | 'out_of_stock'): string => {
  switch (status) {
    case 'in_stock':
      return '✅';
    case 'low_stock':
      return '⚠️';
    case 'out_of_stock':
      return '❌';
    default:
      return '❓';
  }
};
