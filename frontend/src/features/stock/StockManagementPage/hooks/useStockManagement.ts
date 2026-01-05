import { useState, useEffect, useCallback, useRef } from 'react';
import { useIngredients } from '@features/stock/context/IngredientContext';
import stockService from '@features/stock/services/stock.service';
import { subscribeToDashboard } from '@lib/socket.service';
import type { StockProduct, StockTransaction, StockAlert } from '@features/stock/services/stock.service';
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

  // Store loadData in ref to use in intervals/events
  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  // Load data on mount only
  useEffect(() => {
    loadData(true); // Show loading chỉ khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    loadIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto refresh mỗi 60 giây (tăng lên để giảm tải và tránh cảm giác reload)
  // Không show loading khi auto refresh để tránh cảm giác page reload
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      loadDataRef.current(false); // Không show loading
      loadIngredientsRef.current(); // Dùng ref để luôn gọi phiên bản mới nhất
    }, 60000); // 60 giây để giảm tải

    return () => {
      clearInterval(autoRefreshInterval);
    };
  }, []); // Empty deps - only set up interval once

  // Listen to order completed events (localStorage events)
  useEffect(() => {
    const handleStockUpdate = () => {
      loadDataRef.current(false); // Không show loading khi update từ event
      loadIngredientsRef.current(); // Dùng ref để luôn gọi phiên bản mới nhất
    };

    window.addEventListener('orderCompleted', handleStockUpdate);

    return () => {
      window.removeEventListener('orderCompleted', handleStockUpdate);
    };
  }, []); // Empty deps - only set up listener once

  // Subscribe to Socket.io for real-time stock updates
  useEffect(() => {
    const cleanup = subscribeToDashboard(
      (data) => {
        // Dashboard update - reload stock data
        if (data.type === 'stock_update' || data.type === 'order_created' || data.type === 'order_completed') {
          loadDataRef.current(false); // Không show loading
          loadIngredientsRef.current();
        }
      },
      (alert) => {
        // Stock alert - reload alerts
        loadDataRef.current(false); // Không show loading
        loadIngredientsRef.current();
      },
      (stockData) => {
        // Stock updated event - reload stock data immediately
        // Stock updated successfully
        loadDataRef.current(false); // Không show loading
        loadIngredientsRef.current();
      }
    );

    return cleanup;
  }, []); // Empty deps - only subscribe once

  const lowStockCount = stocks.filter((s) => s.currentStock <= s.minStock && s.currentStock > 0).length;
  const outOfStockCount = stocks.filter((s) => s.currentStock === 0).length;
  const unreadAlertsCount = alerts.filter((alert) => !alert.isRead).length;
  const ingredientStats = getIngredientStats();
  const unreadIngredientAlertsCount = ingredientAlerts.filter((alert) => !alert.isRead).length;

  // Debug: Log ingredients data
  useEffect(() => {
    console.log('📊 useStockManagement Debug:', {
      ingredientsCount: ingredients?.length || 0,
      ingredients: ingredients?.slice(0, 3), // Log first 3
      ingredientStats: ingredientStats,
    });
  }, [ingredients, ingredientStats]);

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

