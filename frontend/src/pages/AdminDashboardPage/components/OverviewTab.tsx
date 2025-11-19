import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Shared refs outside component to persist across re-renders
let globalIsLoadingRef = false;
let globalIntervalRef: NodeJS.Timeout | null = null;
let globalHasLoadedRef = false;

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadStats = async (isBackgroundRefresh = false) => {
      // Prevent multiple simultaneous calls - silent skip
      if (globalIsLoadingRef) {
        return;
      }

      try {
        globalIsLoadingRef = true;
        
        // Only show loading spinner on initial load
        if (!isBackgroundRefresh) {
          setIsInitialLoading(true);
        } else {
          setIsRefreshing(true);
        }
        
        const data = await dashboardService.getStats();
        setStats(data);
        globalHasLoadedRef = true;
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Don't clear stats on error if we already have data
        if (!globalHasLoadedRef) {
          setStats(null);
        }
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        globalIsLoadingRef = false;
      }
    };

    // Clear any existing interval first
    if (globalIntervalRef) {
      clearInterval(globalIntervalRef);
      globalIntervalRef = null;
    }

    // Initial load
    loadStats(false);
    
    // Background refresh every 30 seconds (silent, no loading spinner)
    globalIntervalRef = setInterval(() => {
      // Only refresh if data has been loaded and not currently loading
      if (globalHasLoadedRef && !globalIsLoadingRef) {
        loadStats(true);
      }
    }, 30000);
    
    return () => {
      if (globalIntervalRef) {
        clearInterval(globalIntervalRef);
        globalIntervalRef = null;
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
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      gradient: 'from-orange-500 to-orange-600',
      onClick: handleNavigateToOrders,
    },
    {
      id: 'menu',
      title: 'Quản Lý Menu',
      description: 'Quản lý sản phẩm và danh mục',
      icon: CubeIcon,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      gradient: 'from-blue-500 to-blue-600',
      onClick: handleNavigateToMenu,
    },
    {
      id: 'stock',
      title: 'Quản Lý Tồn Kho',
      description: 'Theo dõi và quản lý tồn kho sản phẩm',
      icon: Squares2X2Icon,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      gradient: 'from-green-500 to-green-600',
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng đến Admin Dashboard</h2>
          <p className="text-gray-600">
            Quản lý toàn bộ hệ thống từ một nơi • {currentTime.toLocaleString('vi-VN')}
          </p>
        </div>
        {isRefreshing && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-orange-500"></div>
            <span>Đang cập nhật...</span>
          </div>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Sản Phẩm</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.overview.totalProducts.toLocaleString('vi-VN') || '0'}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <CubeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cảnh Báo Tồn Kho</p>
              <p className="text-3xl font-bold text-gray-900">
                {(lowStockCount + outOfStockCount).toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {lowStockCount} thấp • {outOfStockCount} hết
              </p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Doanh Thu Hôm Nay</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.overview.todayRevenue ? formatPrice(stats.overview.todayRevenue) : '0₫'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.overview.todayOrders || 0} đơn hàng
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Doanh Thu</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.overview.totalRevenue ? formatPrice(stats.overview.totalRevenue) : '0₫'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                TB: {stats?.overview.averageOrderValue ? formatPrice(stats.overview.averageOrderValue) : '0₫'}/đơn
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chức Năng Quản Lý</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={feature.onClick}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all text-left group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className={`bg-gradient-to-br ${feature.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng Thái Đơn Hàng</h3>
            <div className="space-y-3">
              {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {status === 'CREATING' ? 'Đang tạo' :
                     status === 'PENDING' ? 'Chờ xử lý' :
                     status === 'CONFIRMED' ? 'Đã xác nhận' :
                     status === 'PREPARING' ? 'Đang chuẩn bị' :
                     status === 'READY' ? 'Sẵn sàng' :
                     status === 'COMPLETED' ? 'Hoàn thành' :
                     status === 'CANCELLED' ? 'Đã hủy' : status}
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phương Thức Thanh Toán</h3>
            <div className="space-y-3">
              {Object.entries(stats.paymentStats || {}).map(([method, data]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {method === 'cash' ? 'Tiền mặt' :
                     method === 'card' ? 'Thẻ' :
                     method === 'qr' ? 'QR Code' : method}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900 block">{data.count} đơn</span>
                    <span className="text-xs text-gray-500">{formatPrice(data.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {stats && stats.topProducts && stats.topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản Phẩm Bán Chạy</h3>
          <div className="space-y-3">
            {stats.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-orange-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category || 'Không có danh mục'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{product.quantity} món</p>
                  <p className="text-xs text-gray-500">{formatPrice(product.revenue)}</p>
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

