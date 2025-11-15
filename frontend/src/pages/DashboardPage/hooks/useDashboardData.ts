// Dashboard data hook
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import dashboardService from '@services/dashboard.service';
import stockService from '@services/stock.service.ts';
import type { DashboardDailySales, DashboardStats } from '../types';
import type { StockAlert } from '@services/stock.service.ts';

export const useDashboardData = () => {
  const [dailySales, setDailySales] = useState<DashboardDailySales | null>(null);
  const [yesterdaySales, setYesterdaySales] = useState<DashboardDailySales | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [outOfStockCount, setOutOfStockCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<string>(getTodayISO());

  // Helper function to get today's date in ISO format (YYYY-MM-DD)
  function getTodayISO(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Always fetch fresh data, no caching
      // Each day is independent - always get today's data
      const todayISO = getTodayISO();
      
      // Check if it's a new day before fetching
      if (currentDate !== todayISO) {
        // New day detected - clear old data first
        setCurrentDate(todayISO);
        setDailySales(null);
        setStats(null);
      }
      
      const [statsResponse, todaySalesResponse, yesterdaySalesResponse, alertsResponse] = await Promise.all([
        dashboardService.getStats(), // This always calculates today's stats fresh
        dashboardService.getDailySales(todayISO), // Explicitly pass today's date - no cache
        dashboardService.getDailySales(getYesterdayISO()), // Yesterday for comparison
        stockService.getAlerts(),
      ]);

      // Only set data if it's still today (prevent race conditions)
      const stillToday = getTodayISO();
      if (stillToday === todayISO) {
        setStats(statsResponse);
        setDailySales(todaySalesResponse);
        setYesterdaySales(yesterdaySalesResponse);
        setStockAlerts(alertsResponse);

        const lowStockProducts = statsResponse.lowStock.products || [];
        const lowStockIngredients = statsResponse.lowStock.ingredients || [];

        const outOfStockProducts = lowStockProducts.filter((item) => item.quantity === 0).length;
        const outOfStockIngredients = lowStockIngredients.filter((item) => item.quantity === 0).length;
        setOutOfStockCount(outOfStockProducts + outOfStockIngredients);

        const lowProducts = lowStockProducts.filter(
          (item) => item.quantity > 0 && item.quantity <= item.minStock,
        ).length;
        const lowIngredients = lowStockIngredients.filter(
          (item) => item.quantity > 0 && item.quantity <= item.minStock,
        ).length;
        setLowStockCount(lowProducts + lowIngredients);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Không thể tải dữ liệu Dashboard. Vui lòng thử lại.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  // Update time every second and check for new day
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check if it's a new day
      const todayISO = getTodayISO();
      if (currentDate !== todayISO) {
        // New day detected - reset data
        setCurrentDate(todayISO);
        setDailySales(null);
        setStats(null);
        // Reload data for new day
        fetchDashboardData();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentDate, fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();

    const handleOrderUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsConnected(true);
      fetchDashboardData();
      
      // Show notification for new order
      if (customEvent.detail) {
        toast.success(`🛒 Đơn hàng mới: ${formatCurrency(customEvent.detail.total)}`, {
          duration: 3000,
          position: 'top-right',
        });
      }
    };
    
    window.addEventListener('orderCompleted', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('orderCompleted', handleOrderUpdate);
    };
  }, [fetchDashboardData]);

  return {
    dailySales,
    yesterdaySales,
    stats,
    isLoading,
    currentTime,
    isConnected,
    stockAlerts,
    lowStockCount,
    outOfStockCount,
    reloadData: fetchDashboardData,
  };
};

// Helper function for currency formatting
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getYesterdayISO = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

