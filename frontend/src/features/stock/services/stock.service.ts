import apiClient from '@lib/api.service';
import { API_ENDPOINTS } from '@/config/api';

export type StockTransactionType = 'sale' | 'purchase' | 'adjustment' | 'return';

export interface StockProduct {
  id: string;
  productId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: number;
  isActive: boolean;
  product?: {
    id: string;
    name: string;
    price?: number;
    description?: string;
    image?: string | null;
    category?: {
      id: string;
      name: string;
    };
  };
}

export interface StockIngredient {
  id: string;
  ingredientId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: number;
  isActive: boolean;
  ingredient?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface StockTransaction {
  id: string;
  productId?: string;
  ingredientId?: string;
  type: StockTransactionType;
  quantity: number;
  reason?: string;
  timestamp: number;
  userId?: string;
  product?: {
    id: string;
    name: string;
  };
  ingredient?: {
    id: string;
    name: string;
  };
}

export type StockAlertType = 'low_stock' | 'out_of_stock' | 'overstock';

export interface StockAlert {
  id: string;
  productId?: string;
  ingredientId?: string;
  type: StockAlertType;
  message: string;
  timestamp: number;
  isRead: boolean;
  product?: {
    id: string;
    name: string;
  };
  ingredient?: {
    id: string;
    name: string;
  };
}

export interface UpdateProductStockInput {
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  isActive?: boolean;
}

export interface UpdateIngredientStockInput {
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
  name?: string;
  unit?: string;
}

interface CreateTransactionInput {
  productId?: string;
  ingredientId?: string;
  type: StockTransactionType;
  quantity: number;
  reason?: string;
  userId?: string;
}

interface StockAlertFilters {
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

type NumericString = string | number;

const normalize = (value: NumericString | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const stockService = {
  async getProductStocks(): Promise<StockProduct[]> {
    const response = await apiClient.get<any[]>(API_ENDPOINTS.STOCK_PRODUCTS);
    return response.map((item) => ({
      id: item.id,
      productId: item.productId,
      currentStock: normalize(item.currentStock ?? item.quantity),
      minStock: normalize(item.minStock),
      maxStock: normalize(item.maxStock),
      unit: item.unit ?? 'cái',
      lastUpdated: typeof item.lastUpdated === 'number' ? item.lastUpdated : Date.parse(item.lastUpdated),
      isActive: Boolean(item.isActive),
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            price: normalize(item.product.price),
            description: item.product.description || undefined,
            image: item.product.image,
            category: item.product.category
              ? {
                  id: item.product.category.id,
                  name: item.product.category.name,
                }
              : undefined,
          }
        : undefined,
    }));
  },

  async getIngredientStocks(): Promise<StockIngredient[]> {
    const response = await apiClient.get<any[]>(API_ENDPOINTS.STOCK_INGREDIENTS);
    return response.map((item) => ({
      id: item.id,
      ingredientId: item.ingredientId,
      currentStock: normalize(item.currentStock ?? item.quantity),
      minStock: normalize(item.minStock),
      maxStock: normalize(item.maxStock),
      unit: item.unit ?? item.ingredient?.unit ?? 'cái',
      lastUpdated: typeof item.lastUpdated === 'number' ? item.lastUpdated : Date.parse(item.lastUpdated),
      isActive: Boolean(item.isActive),
      ingredient: item.ingredient
        ? {
            id: item.ingredient.id,
            name: item.ingredient.name,
            unit: item.ingredient.unit,
          }
        : undefined,
    }));
  },

  async updateProductStock(id: string, data: UpdateProductStockInput): Promise<StockProduct> {
    const response = await apiClient.put<any>(API_ENDPOINTS.STOCK_PRODUCT_BY_ID(id), data);
    return {
      id: response.id,
      productId: response.productId,
      currentStock: normalize(response.currentStock ?? response.quantity),
      minStock: normalize(response.minStock),
      maxStock: normalize(response.maxStock),
      unit: response.unit ?? 'cái',
      lastUpdated: typeof response.lastUpdated === 'number' ? response.lastUpdated : Date.parse(response.lastUpdated),
      isActive: Boolean(response.isActive),
      product: response.product
        ? {
            id: response.product.id,
            name: response.product.name,
            price: normalize(response.product.price),
            description: response.product.description || undefined,
            image: response.product.image,
            category: response.product.category
              ? {
                  id: response.product.category.id,
                  name: response.product.category.name,
                }
              : undefined,
          }
        : undefined,
    };
  },

  async createProductStock(data: CreateProductStockInput): Promise<StockProduct> {
    const response = await apiClient.post<any>(API_ENDPOINTS.STOCK_PRODUCTS, data);
    return {
      id: response.id,
      productId: response.productId,
      currentStock: normalize(response.currentStock ?? response.quantity),
      minStock: normalize(response.minStock),
      maxStock: normalize(response.maxStock),
      unit: response.unit ?? 'cái',
      lastUpdated: typeof response.lastUpdated === 'number' ? response.lastUpdated : Date.parse(response.lastUpdated),
      isActive: Boolean(response.isActive),
      product: response.product
        ? {
            id: response.product.id,
            name: response.product.name,
            price: normalize(response.product.price),
            description: response.product.description || undefined,
            image: response.product.image,
            category: response.product.category
              ? {
                  id: response.product.category.id,
                  name: response.product.category.name,
                }
              : undefined,
          }
        : undefined,
    };
  },

  async deleteProductStock(id: string): Promise<{ message: string }> {
    return apiClient.delete(`${API_ENDPOINTS.STOCK_PRODUCTS}/${id}`);
  },

  async updateIngredientStock(id: string, data: UpdateIngredientStockInput): Promise<StockIngredient> {
    const response = await apiClient.put<any>(`${API_ENDPOINTS.STOCK_INGREDIENTS}/${id}`, data);
    return {
      id: response.id,
      ingredientId: response.ingredientId,
      currentStock: normalize(response.currentStock ?? response.quantity),
      minStock: normalize(response.minStock),
      maxStock: normalize(response.maxStock),
      unit: response.unit ?? response.ingredient?.unit ?? 'cái',
      lastUpdated: typeof response.lastUpdated === 'number' ? response.lastUpdated : Date.parse(response.lastUpdated),
      isActive: Boolean(response.isActive),
      ingredient: response.ingredient
        ? {
            id: response.ingredient.id,
            name: response.ingredient.name,
            unit: response.ingredient.unit,
          }
        : undefined,
    };
  },

  async createIngredient(data: CreateIngredientInput): Promise<StockIngredient> {
    const response = await apiClient.post<any>(API_ENDPOINTS.STOCK_INGREDIENTS, data);
    return {
      id: response.id,
      ingredientId: response.ingredientId,
      currentStock: normalize(response.currentStock ?? response.quantity),
      minStock: normalize(response.minStock),
      maxStock: normalize(response.maxStock),
      unit: response.unit ?? response.ingredient?.unit ?? 'cái',
      lastUpdated: typeof response.lastUpdated === 'number' ? response.lastUpdated : Date.parse(response.lastUpdated),
      isActive: Boolean(response.isActive),
      ingredient: response.ingredient
        ? {
            id: response.ingredient.id,
            name: response.ingredient.name,
            unit: response.ingredient.unit,
          }
        : undefined,
    };
  },

  async deleteIngredient(id: string): Promise<{ message: string }> {
    return apiClient.delete(`${API_ENDPOINTS.STOCK_INGREDIENTS}/${id}`);
  },

  async createTransaction(data: CreateTransactionInput): Promise<StockTransaction> {
    const response = await apiClient.post<any>(API_ENDPOINTS.STOCK_TRANSACTIONS, data);
    return {
      id: response.id,
      productId: response.productId || undefined,
      ingredientId: response.ingredientId || undefined,
      type: response.type,
      quantity: normalize(response.quantity),
      reason: response.reason || undefined,
      timestamp: typeof response.timestamp === 'number' ? response.timestamp : Date.parse(response.timestamp),
      userId: response.userId || undefined,
      product: response.product
        ? {
            id: response.product.id,
            name: response.product.name,
          }
        : undefined,
      ingredient: response.ingredient
        ? {
            id: response.ingredient.id,
            name: response.ingredient.name,
          }
        : undefined,
    };
  },

  async getTransactions(filters?: { productId?: string; ingredientId?: string }): Promise<StockTransaction[]> {
    const response = await apiClient.get<any[]>(API_ENDPOINTS.STOCK_TRANSACTIONS, {
      params: filters,
    });
    return response.map((item) => ({
      id: item.id,
      productId: item.productId || undefined,
      ingredientId: item.ingredientId || undefined,
      type: item.type,
      quantity: normalize(item.quantity),
      reason: item.reason || undefined,
      timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.parse(item.timestamp),
      userId: item.userId || undefined,
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
          }
        : undefined,
      ingredient: item.ingredient
        ? {
            id: item.ingredient.id,
            name: item.ingredient.name,
          }
        : undefined,
    }));
  },

  async getAlerts(filters?: StockAlertFilters): Promise<StockAlert[]> {
    const response = await apiClient.get<any[]>(API_ENDPOINTS.STOCK_ALERTS, {
      params: filters,
    });
    return response.map((item) => ({
      id: item.id,
      productId: item.productId || undefined,
      ingredientId: item.ingredientId || undefined,
      type: item.type,
      message: item.message,
      timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.parse(item.timestamp),
      isRead: Boolean(item.isRead),
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
          }
        : undefined,
      ingredient: item.ingredient
        ? {
            id: item.ingredient.id,
            name: item.ingredient.name,
          }
        : undefined,
    }));
  },

  async markAlertAsRead(id: string): Promise<StockAlert> {
    const response = await apiClient.put<any>(`${API_ENDPOINTS.STOCK_ALERTS}/${id}/read`);
    return {
      id: response.id,
      productId: response.productId || undefined,
      ingredientId: response.ingredientId || undefined,
      type: response.type,
      message: response.message,
      timestamp: typeof response.timestamp === 'number' ? response.timestamp : Date.parse(response.timestamp),
      isRead: Boolean(response.isRead),
      product: response.product
        ? {
            id: response.product.id,
            name: response.product.name,
          }
        : undefined,
      ingredient: response.ingredient
        ? {
            id: response.ingredient.id,
            name: response.ingredient.name,
          }
        : undefined,
    };
  },
};

export default stockService;

