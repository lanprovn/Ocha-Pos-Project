import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CubeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { ROUTES } from '../../../constants';
import { dashboardService, type DashboardStats } from '../../../services/dashboard.service';
import { formatPrice } from '../../../utils/formatPrice';

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Use refs inside component instead of global refs (React best practice)
  const isLoadingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadStats = async (isBackgroundRefresh = false) => {
      // Prevent multiple simultaneous calls - silent skip
      if (isLoadingRef.current) {
        return;
      }

      try {
        isLoadingRef.current = true;
        
        // Only show loading spinner on initial load
        if (!isBackgroundRefresh) {
          setIsInitialLoading(true);
        } else {
          setIsRefreshing(true);
        }
        
        const data = await dashboardService.getStats();
        setStats(data);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Don't clear stats on error if we already have data
        if (!hasLoadedRef.current) {
          setStats(null);
        }
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        isLoadingRef.current = false;
      }
    };

    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Initial load
    loadStats(false);
    
    // Background refresh every 30 seconds (silent, no loading spinner)
    intervalRef.current = setInterval(() => {
      // Only refresh if data has been loaded and not currently loading
      if (hasLoadedRef.current && !isLoadingRef.current) {
        loadStats(true);
      }
    }, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty deps - only run once on mount

  // Memoize navigation handlers
  const handleNavigateToOrders = useCallback(() => {
    navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=orders`);
  }, [navigate]);

  const handleNavigateToMenu = useCallback(() => {
    navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=menu`);
  }, [navigate]);

  const handleNavigateToStock = useCallback(() => {
    navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=stock`);
  }, [navigate]);

  const handleNavigateToAnalytics = useCallback(() => {
    navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=analytics`);
  }, [navigate]);

  // Memoize adminFeatures with stable callbacks
  const adminFeatures = useMemo(() => [
    {
      id: 'orders',
      title: 'Quản Lý Đơn Hàng',
      description: 'Xem và quản lý tất cả đơn hàng',
      icon: DocumentChartBarIcon,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      gradient: 'from-blue-500 to-blue-600',
      onClick: handleNavigateToOrders,
    },
    {
      id: 'menu',
      title: 'Quản Lý Menu',
      description: 'Quản lý sản phẩm và danh mục',
      icon: CubeIcon,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600',
      onClick: handleNavigateToMenu,
    },
    {
      id: 'stock',
      title: 'Quản Lý Tồn Kho',
      description: 'Theo dõi và quản lý tồn kho sản phẩm',
      icon: Squares2X2Icon,
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      gradient: 'from-emerald-500 to-emerald-600',
      onClick: handleNavigateToStock,
    },
    {
      id: 'analytics',
      title: 'Phân Tích & Báo Cáo',
      description: 'Xem báo cáo doanh thu và thống kê',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      gradient: 'from-purple-500 to-purple-600',
      onClick: handleNavigateToAnalytics,
    },
  ], [handleNavigateToOrders, handleNavigateToMenu, handleNavigateToStock, handleNavigateToAnalytics]);

  // Memoize stock counts to prevent recalculation
  const { lowStockCount, outOfStockCount } = useMemo(() => {
    if (!stats?.lowStock) {
      return { lowStockCount: 0, outOfStockCount: 0 };
    }
    
    const lowStockProducts = stats.lowStock.products?.filter((p) => p.quantity > 0 && p.quantity <= p.minStock).length || 0;
    const lowStockIngredients = stats.lowStock.ingredients?.filter((i) => i.quantity > 0 && i.quantity <= i.minStock).length || 0;
    const outOfStockProducts = stats.lowStock.products?.filter((p) => p.quantity === 0).length || 0;
    const outOfStockIngredients = stats.lowStock.ingredients?.filter((i) => i.quantity === 0).length || 0;
    
    return {
      lowStockCount: lowStockProducts + lowStockIngredients,
      outOfStockCount: outOfStockProducts + outOfStockIngredients,
    };
  }, [stats?.lowStock]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Chào mừng đến Admin Dashboard</h2>
          <p className="text-slate-600 font-medium">
            Quản lý toàn bộ hệ thống từ một nơi • <span className="text-slate-500">{currentTime.toLocaleString('vi-VN')}</span>
          </p>
        </div>
        {isRefreshing && (
          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-blue-600"></div>
            <span className="font-medium">Đang cập nhật...</span>
          </div>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Tổng Sản Phẩm</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {stats?.overview.totalProducts.toLocaleString('vi-VN') || '0'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <CubeIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Cảnh Báo Tồn Kho</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {(lowStockCount + outOfStockCount).toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {lowStockCount} thấp • {outOfStockCount} hết
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Doanh Thu Hôm Nay</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {stats?.overview.todayRevenue ? formatPrice(stats.overview.todayRevenue) : '0₫'}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {stats?.overview.todayOrders || 0} đơn hàng
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Tổng Doanh Thu</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {stats?.overview.totalRevenue ? formatPrice(stats.overview.totalRevenue) : '0₫'}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                TB: {stats?.overview.averageOrderValue ? formatPrice(stats.overview.averageOrderValue) : '0₫'}/đơn
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Chức Năng Quản Lý</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={feature.onClick}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200 text-left group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-3 group-hover:opacity-5 transition-opacity`} />
                <div className={`bg-gradient-to-br ${feature.gradient} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 font-medium">{feature.description}</p>
                <div className="mt-4 flex items-center text-sm text-slate-400 group-hover:text-blue-600 transition-colors font-medium">
                  <span>Truy cập</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Status Summary */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5 tracking-tight">Trạng Thái Đơn Hàng</h3>
            <div className="space-y-3">
              {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-600 capitalize font-medium">
                    {status === 'CREATING' ? 'Đang tạo' :
                     status === 'PENDING' ? 'Chờ xử lý' :
                     status === 'CONFIRMED' ? 'Đã xác nhận' :
                     status === 'PREPARING' ? 'Đang chuẩn bị' :
                     status === 'READY' ? 'Sẵn sàng' :
                     status === 'COMPLETED' ? 'Hoàn thành' :
                     status === 'CANCELLED' ? 'Đã hủy' : status}
                  </span>
                  <span className="text-lg font-bold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5 tracking-tight">Phương Thức Thanh Toán</h3>
            <div className="space-y-3">
              {Object.entries(stats.paymentStats || {}).map(([method, data]) => (
                <div key={method} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-600 capitalize font-medium">
                    {method === 'cash' ? 'Tiền mặt' :
                     method === 'card' ? 'Thẻ' :
                     method === 'qr' ? 'QR Code' : method}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900 block">{data.count} đơn</span>
                    <span className="text-xs text-slate-500 font-medium">{formatPrice(data.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {stats && stats.topProducts && stats.topProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-5 tracking-tight">Sản Phẩm Bán Chạy</h3>
          <div className="space-y-3">
            {stats.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-amber-300 to-amber-400 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{product.category || 'Không có danh mục'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{product.quantity} món</p>
                  <p className="text-xs text-slate-500 font-medium">{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(OverviewTab);

