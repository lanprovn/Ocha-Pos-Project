import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import stockService, { type CreateIngredientInput, type UpdateIngredientStockInput } from '@features/stock/services/stock.service';
import type { StockIngredient, StockTransaction, StockAlert } from '@features/stock/services/stock.service';
import type { IngredientStock, IngredientTransaction, IngredientAlert } from '@utils/ingredientManagement';

interface IngredientContextType {
  // State
  ingredients: IngredientStock[];
  transactions: IngredientTransaction[];
  alerts: IngredientAlert[];
  isLoading: boolean;
  
  // Actions
  loadIngredients: () => void;
  addIngredient: (input: CreateIngredientInput) => Promise<void>;
  updateIngredient: (stockId: string, updates: UpdateIngredientStockInput) => Promise<void>;
  deleteIngredient: (ingredientId: string) => Promise<void>;
  
  // Stock operations
  addStock: (ingredientId: string, quantity: number, reason?: string) => void;
  deductStock: (ingredientId: string, quantity: number) => void;
  adjustStock: (ingredientId: string, newQuantity: number, reason?: string) => void;
  
  // Alerts
  markAlertAsRead: (alertId: string) => void;
  getLowStockIngredients: () => IngredientStock[];
  getOutOfStockIngredients: () => IngredientStock[];
  
  // Statistics
  getStats: () => {
    total: number;
    lowStock: number;
    outOfStock: number;
    unreadAlerts: number;
  };
}

const IngredientContext = createContext<IngredientContextType | undefined>(undefined);

export const useIngredients = () => {
  const context = useContext(IngredientContext);
  if (context === undefined) {
    throw new Error('useIngredients must be used within an IngredientProvider');
  }
  return context;
};

interface IngredientProviderProps {
  children: ReactNode;
}

export const IngredientProvider: React.FC<IngredientProviderProps> = ({ children }) => {
  const [ingredients, setIngredients] = useState<IngredientStock[]>([]);
  const [transactions, setTransactions] = useState<IngredientTransaction[]>([]);
  const [alerts, setAlerts] = useState<IngredientAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const mapIngredientStock = (stock: StockIngredient): IngredientStock => ({
    id: stock.ingredient?.id || stock.ingredientId,
    stockId: stock.id,
    name: stock.ingredient?.name || 'Nguyên liệu',
    unit: stock.unit || stock.ingredient?.unit || 'cái',
    currentStock: stock.currentStock,
    minStock: stock.minStock,
    maxStock: stock.maxStock,
    usedIn: [],
    lastUpdated: stock.lastUpdated,
    isActive: stock.isActive,
  });

  const mapIngredientAlert = (alert: StockAlert): IngredientAlert => ({
    id: alert.id,
    ingredientId: alert.ingredientId || '',
    type: alert.type,
    message: alert.message,
    timestamp: alert.timestamp,
    isRead: alert.isRead,
  });

  const mapIngredientTransaction = (transaction: StockTransaction): IngredientTransaction => ({
    id: transaction.id,
    ingredientId: transaction.ingredientId || '',
    type: transaction.type,
    quantity: transaction.quantity,
    reason: transaction.reason,
    timestamp: transaction.timestamp,
    userId: transaction.userId,
  });

  const loadIngredients = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading ingredients from API...');
      const [stocks, transactionsResponse, alertsResponse] = await Promise.all([
        stockService.getIngredientStocks(),
        stockService.getTransactions(),
        stockService.getAlerts(),
      ]);

      console.log('📦 Raw ingredient stocks from API:', stocks);
      console.log('📊 Ingredient stocks count:', stocks?.length || 0);

      const ingredientStocks = stocks.map(mapIngredientStock);
      const ingredientTransactions = transactionsResponse
        .filter((txn) => txn.ingredientId)
        .map(mapIngredientTransaction);
      const ingredientAlerts = alertsResponse.filter((alert) => alert.ingredientId).map(mapIngredientAlert);

      console.log('✅ Mapped ingredient stocks:', ingredientStocks);
      console.log('✅ Total ingredients loaded:', ingredientStocks.length);

      setIngredients(ingredientStocks);
      setTransactions(ingredientTransactions);
      setAlerts(ingredientAlerts);
    } catch (error) {
      console.error('❌ Error loading ingredient data:', error);
      setIngredients([]);
      setTransactions([]);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addIngredient = async (input: CreateIngredientInput) => {
    try {
      await stockService.createIngredient(input);
      await loadIngredients();
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  };

  const updateIngredient = async (stockId: string, updates: UpdateIngredientStockInput) => {
    try {
      await stockService.updateIngredientStock(stockId, updates);
      await loadIngredients();
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  };

  const deleteIngredient = async (ingredientId: string) => {
    try {
      await stockService.deleteIngredient(ingredientId);
      await loadIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  };

  const addStock = async (ingredientId: string, quantity: number, reason?: string) => {
    try {
      await stockService.createTransaction({
        ingredientId,
        type: 'purchase',
        quantity,
        reason,
      });
      await loadIngredients();
    } catch (error) {
      console.error('Error adding ingredient stock:', error);
    }
  };

  const deductStock = async (ingredientId: string, quantity: number) => {
    try {
      await stockService.createTransaction({
        ingredientId,
        type: 'sale',
        quantity,
      });
      await loadIngredients();
    } catch (error) {
      console.error('Error deducting ingredient stock:', error);
    }
  };

  const adjustStock = async (ingredientId: string, newQuantity: number, reason?: string) => {
    try {
      await stockService.createTransaction({
        ingredientId,
        type: 'adjustment',
        quantity: newQuantity,
        reason,
      });
      await loadIngredients();
    } catch (error) {
      console.error('Error adjusting ingredient stock:', error);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      await stockService.markAlertAsRead(alertId);
      await loadIngredients();
    } catch (error) {
      console.error('Error marking ingredient alert as read:', error);
    }
  };

  const getLowStockIngredients = useCallback(() => {
    return ingredients.filter(
      (ingredient) => ingredient.currentStock > 0 && ingredient.currentStock <= (ingredient.minStock ?? 0)
    );
  }, [ingredients]);

  const getOutOfStockIngredients = useCallback(() => {
    return ingredients.filter((ingredient) => ingredient.currentStock === 0);
  }, [ingredients]);

  const getStats = () => {
    const lowStock = getLowStockIngredients().length;
    const outOfStock = getOutOfStockIngredients().length;
    const unreadAlerts = alerts.filter((alert) => !alert.isRead).length;

    return {
      total: ingredients.length,
      lowStock,
      outOfStock,
      unreadAlerts,
    };
  };

  // Load ingredients on mount only
  useEffect(() => {
    loadIngredients();
  }, []); // Chỉ chạy 1 lần khi mount, không phụ thuộc vào loadIngredients để tránh infinite loop

  const value: IngredientContextType = {
    ingredients,
    transactions,
    alerts,
    isLoading,
    loadIngredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addStock,
    deductStock,
    adjustStock,
    markAlertAsRead,
    getLowStockIngredients,
    getOutOfStockIngredients,
    getStats
  };

  return (
    <IngredientContext.Provider value={value}>
      {children}
    </IngredientContext.Provider>
  );
};

