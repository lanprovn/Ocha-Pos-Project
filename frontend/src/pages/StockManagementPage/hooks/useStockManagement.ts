import { useState, useEffect, useCallback, useRef } from 'react';
import { useIngredients } from '@context/IngredientContext';
import stockService from '@services/stock.service.ts';
import { subscribeToDashboard } from '@services/socket.service';
import type { StockProduct, StockTransaction, StockAlert } from '@services/stock.service.ts';
import type { StockTab, StockFilter } from '../types';

export const useStockManagement = () => {
  const {
    ingredients,
    alerts: ingredientAlerts,
    getStats: getIngredientStats,
    loadIngredients,
  } = useIngredients();

  const [stocks, setStocks] = useState<StockProduct[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<StockTab>('stocks');
  const [filter, setFilter] = useState<StockFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Use refs để lưu các function và luôn gọi phiên bản mới nhất
  const loadIngredientsRef = useRef(loadIngredients);
  useEffect(() => {
    loadIngredientsRef.current = loadIngredients;
  }, [loadIngredients]);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const [productStocks, stockTransactions, stockAlerts] = await Promise.all([
        stockService.getProductStocks(),
        stockService.getTransactions(),
        stockService.getAlerts(),
      ]);
      setStocks(productStocks);
      setTransactions(stockTransactions);
      setAlerts(stockAlerts);
    } catch (error) {
      console.error('Error loading stock data:', error);
      setStocks([]);
      setTransactions([]);
      setAlerts([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load data on mount only - tách riêng để tránh re-run
  useEffect(() => {
    loadData(true); // Show loading chỉ khi mount
  }, [loadData]);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  // Auto refresh mỗi 60 giây (tăng lên để giảm tải và tránh cảm giác reload)
  // Không show loading khi auto refresh để tránh cảm giác page reload
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      loadData(false); // Không show loading
      loadIngredientsRef.current(); // Dùng ref để luôn gọi phiên bản mới nhất
    }, 60000); // 60 giây để giảm tải

    return () => {
      clearInterval(autoRefreshInterval);
    };
  }, [loadData]); // Chỉ phụ thuộc vào loadData

  // Listen to order completed events (localStorage events)
  useEffect(() => {
    const handleStockUpdate = () => {
      loadData(false); // Không show loading khi update từ event
      loadIngredientsRef.current(); // Dùng ref để luôn gọi phiên bản mới nhất
    };

    window.addEventListener('orderCompleted', handleStockUpdate);

    return () => {
      window.removeEventListener('orderCompleted', handleStockUpdate);
    };
  }, [loadData]); // Chỉ phụ thuộc vào loadData

  // Subscribe to Socket.io for real-time stock updates
  useEffect(() => {
    const cleanup = subscribeToDashboard(
      (data) => {
        // Dashboard update - reload stock data
        if (data.type === 'stock_update' || data.type === 'order_created' || data.type === 'order_completed') {
          loadData(false); // Không show loading
          loadIngredientsRef.current();
        }
      },
      (alert) => {
        // Stock alert - reload alerts
        loadData(false); // Không show loading
        loadIngredientsRef.current();
      }
    );

    return cleanup;
  }, [loadData]); // Chỉ phụ thuộc vào loadData

  const lowStockCount = stocks.filter((s) => s.currentStock <= s.minStock && s.currentStock > 0).length;
  const outOfStockCount = stocks.filter((s) => s.currentStock === 0).length;
  const unreadAlertsCount = alerts.filter((alert) => !alert.isRead).length;
  const ingredientStats = getIngredientStats();
  const unreadIngredientAlertsCount = ingredientAlerts.filter((alert) => !alert.isRead).length;

  return {
    stocks,
    transactions,
    alerts,
    isLoading,
    activeTab,
    setActiveTab,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    ingredients,
    ingredientAlerts,
    ingredientStats,
    lowStockCount,
    outOfStockCount,
    unreadAlertsCount,
    unreadIngredientAlertsCount,
    reloadData: loadData,
    reloadIngredients: loadIngredients,
  };
};

