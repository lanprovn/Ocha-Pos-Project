export interface UpdateStockProductInput {
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  isActive?: boolean;
}

export interface UpdateStockIngredientInput {
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
  name?: string;
  unit?: string;
}

export interface CreateStockTransactionInput {
  productId?: string | null;
  ingredientId?: string | null;
  type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  reason?: string | null;
  userId?: string | null;
}

export interface CreateStockAlertInput {
  productId?: string | null;
  ingredientId?: string | null;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
  message: string;
}

export interface UpdateStockAlertInput {
  isRead?: boolean;
  message?: string;
}

export interface StockFilters {
  productId?: string;
  ingredientId?: string;
  isRead?: boolean;
}

export interface CreateProductStockInput {
  productId: string;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  isActive?: boolean;
}

export interface CreateIngredientInput {
  name: string;
  unit: string;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
}

export interface UpdateIngredientInput {
  name?: string;
  unit?: string;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
}

