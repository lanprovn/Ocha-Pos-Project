// Dashboard data hook
import { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import toast from 'react-hot-toast';
import dashboardService from '@features/dashboard/services/dashboard.service';
import stockService from '@features/stock/services/stock.service';
import type { DashboardDailySales, DashboardStats } from '../types';
import type { StockAlert } from '@features/stock/services/stock.service';

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

  // Use ref to prevent multiple simultaneous calls
  const isLoadingRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    // Prevent multiple simultaneous calls - silent skip
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    const errors: string[] = [];
    
    try {
      // ✅ OPTIMIZED: Parallel API calls using Promise.allSettled for graceful error handling
      const [statsResult, todaySalesResult, yesterdaySalesResult, alertsResult] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getDailySales(),
        dashboardService.getDailySales(getYesterdayISO()),
        stockService.getAlerts(),
      ]);

      // Process stats response
      if (statsResult.status === 'fulfilled') {
        const statsResponse = statsResult.value;
        setStats(statsResponse);

        const lowStockProducts = statsResponse.lowStock?.products || [];
        const lowStockIngredients = statsResponse.lowStock?.ingredients || [];

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
      } else {
        console.error('Error loading dashboard stats:', statsResult.reason);
        errors.push('Thống kê');
        setStats(null);
      }

      // Process today sales response
      if (todaySalesResult.status === 'fulfilled') {
        setDailySales(todaySalesResult.value);
      } else {
        console.error('Error loading today sales:', todaySalesResult.reason);
        errors.push('Doanh số hôm nay');
        setDailySales(null);
      }

      // Process yesterday sales response (optional, don't add to errors)
      if (yesterdaySalesResult.status === 'fulfilled') {
        setYesterdaySales(yesterdaySalesResult.value);
      } else {
        console.error('Error loading yesterday sales:', yesterdaySalesResult.reason);
        setYesterdaySales(null);
      }

      // Process alerts response
      if (alertsResult.status === 'fulfilled') {
        setStockAlerts(alertsResult.value);
      } else {
        console.error('Error loading stock alerts:', alertsResult.reason);
        errors.push('Cảnh báo tồn kho');
        setStockAlerts([]);
      }

      // Show error toast only if critical errors occurred
      if (errors.length > 0) {
        const errorMessage = errors.length === 1 
          ? `Không thể tải ${errors[0]}. Vui lòng kiểm tra kết nối API.`
          : `Không thể tải một số dữ liệu: ${errors.join(', ')}. Vui lòng kiểm tra kết nối API.`;
        
        // Only show one toast, dismiss previous ones
        toast.error(errorMessage, {
          id: 'dashboard-load-error',
          duration: 5000,
        });
        setIsConnected(false);
      } else {
        setIsConnected(true);
        // Dismiss any previous error toasts
        toast.dismiss('dashboard-load-error');
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Update time every second - use startTransition for non-blocking updates
  useEffect(() => {
    const timer = setInterval(() => {
      startTransition(() => {
        setCurrentTime(new Date());
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Store fetchDashboardData in ref to use in event listener
  const fetchDashboardDataRef = useRef(fetchDashboardData);
  useEffect(() => {
    fetchDashboardDataRef.current = fetchDashboardData;
  }, [fetchDashboardData]);

  // Load data on mount only - fetchDashboardData is stable (useCallback with empty deps)
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle order updates separately
  useEffect(() => {
    const handleOrderUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsConnected(true);
      
      // Debounce: only reload if not currently loading
      if (!isLoadingRef.current) {
        fetchDashboardDataRef.current();
      }
      
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
  }, []); // Empty dependency array - only set up listener once

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

