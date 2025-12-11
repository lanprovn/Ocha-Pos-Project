import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
      onClick: handleNavigateToOrders,
      color: 'blue',
    },
    {
      id: 'menu',
      title: 'Quản Lý Menu',
      description: 'Quản lý sản phẩm và danh mục',
      onClick: handleNavigateToMenu,
      color: 'indigo',
    },
    {
      id: 'stock',
      title: 'Quản Lý Tồn Kho',
      description: 'Theo dõi và quản lý tồn kho sản phẩm',
      onClick: handleNavigateToStock,
      color: 'emerald',
    },
    {
      id: 'analytics',
      title: 'Phân Tích & Báo Cáo',
      description: 'Xem báo cáo doanh thu và thống kê',
      onClick: handleNavigateToAnalytics,
      color: 'purple',
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Tổng quan</h2>
          <p className="text-sm text-slate-500">
            {currentTime.toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {isRefreshing && (
          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-300 border-t-blue-600"></div>
            <span>Đang cập nhật...</span>
          </div>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng Sản Phẩm</p>
          <p className="text-2xl font-bold text-blue-900">
            {stats?.overview.totalProducts.toLocaleString('vi-VN') || '0'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-lg border-l-4 border-amber-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-amber-700 mb-3 font-medium uppercase tracking-wide">Cảnh Báo Tồn Kho</p>
          <p className="text-2xl font-bold text-amber-900 mb-1">
            {(lowStockCount + outOfStockCount).toLocaleString('vi-VN')}
          </p>
          <p className="text-xs text-amber-700 mt-2">
            {lowStockCount} thấp • {outOfStockCount} hết
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-lg border-l-4 border-emerald-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-emerald-700 mb-3 font-medium uppercase tracking-wide">Doanh Thu Hôm Nay</p>
          <p className="text-2xl font-bold text-emerald-900 mb-1">
            {stats?.overview.todayRevenue ? formatPrice(stats.overview.todayRevenue) : '0₫'}
          </p>
          <p className="text-xs text-emerald-700 mt-2">
            {stats?.overview.todayOrders || 0} đơn hàng
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-100/50 rounded-lg border-l-4 border-indigo-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-indigo-700 mb-3 font-medium uppercase tracking-wide">Tổng Doanh Thu</p>
          <p className="text-2xl font-bold text-indigo-900 mb-1">
            {stats?.overview.totalRevenue ? formatPrice(stats.overview.totalRevenue) : '0₫'}
          </p>
          <p className="text-xs text-indigo-700 mt-2">
            TB: {stats?.overview.averageOrderValue ? formatPrice(stats.overview.averageOrderValue) : '0₫'}/đơn
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Chức Năng Quản Lý</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminFeatures.map((feature) => {
            const colorClasses = {
              blue: 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 group-hover:text-blue-600',
              indigo: 'border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 group-hover:text-indigo-600',
              emerald: 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 group-hover:text-emerald-600',
              purple: 'border-purple-300 hover:border-purple-400 hover:bg-purple-50 group-hover:text-purple-600',
            };
            return (
              <button
                key={feature.id}
                onClick={feature.onClick}
                className={`bg-white rounded-lg border-2 ${colorClasses[feature.color as keyof typeof colorClasses]} p-5 hover:shadow-md transition-all text-left group`}
              >
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3">{feature.description}</p>
                <div className={`flex items-center text-sm text-slate-400 ${colorClasses[feature.color as keyof typeof colorClasses]} transition-colors font-medium`}>
                  <span>Xem chi tiết</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Trạng Thái Đơn Hàng</h3>
            <div className="space-y-2">
              {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => {
                const statusConfig: Record<string, { label: string; bg: string; border: string; text: string }> = {
                  CREATING: { label: 'Đang tạo', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
                  PENDING: { label: 'Chờ xử lý', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
                  CONFIRMED: { label: 'Đã xác nhận', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
                  PREPARING: { label: 'Đang chuẩn bị', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
                  READY: { label: 'Sẵn sàng', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                  COMPLETED: { label: 'Hoàn thành', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
                  CANCELLED: { label: 'Đã hủy', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
                };
                const config = statusConfig[status] || { label: status, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' };
                return (
                  <div key={status} className={`flex items-center justify-between py-2.5 px-3 rounded border ${config.border} ${config.bg} hover:shadow-sm transition-all`}>
                    <span className={`text-sm font-medium ${config.text}`}>
                      {config.label}
                    </span>
                    <span className={`text-base font-bold ${config.text}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Phương Thức Thanh Toán</h3>
            <div className="space-y-2">
              {Object.entries(stats.paymentStats || {}).map(([method, data]) => {
                const methodConfig: Record<string, { label: string; bg: string; border: string; text: string }> = {
                  cash: { label: 'Tiền mặt', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                  card: { label: 'Thẻ', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
                  qr: { label: 'QR Code', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
                };
                const config = methodConfig[method] || { label: method, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' };
                return (
                  <div key={method} className={`flex items-center justify-between py-2.5 px-3 rounded border ${config.border} ${config.bg} hover:shadow-sm transition-all`}>
                    <span className={`text-sm font-medium ${config.text}`}>
                      {config.label}
                    </span>
                    <div className="text-right">
                      <span className={`text-base font-bold block ${config.text}`}>{data.count} đơn</span>
                      <span className={`text-xs ${config.text} opacity-75`}>{formatPrice(data.revenue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Products */}
      {stats && stats.topProducts && stats.topProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Sản Phẩm Bán Chạy</h3>
          <div className="space-y-2">
            {stats.topProducts.slice(0, 5).map((product, index) => {
              const rankColors = [
                { bg: 'bg-gradient-to-r from-amber-400 to-orange-500', text: 'text-white', border: 'border-amber-300' },
                { bg: 'bg-gradient-to-r from-slate-400 to-slate-500', text: 'text-white', border: 'border-slate-300' },
                { bg: 'bg-gradient-to-r from-amber-300 to-amber-400', text: 'text-white', border: 'border-amber-200' },
                { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
                { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
              ];
              const rankColor = rankColors[index] || rankColors[3];
              return (
                <div key={product.productId} className={`flex items-center justify-between py-2.5 px-3 rounded border ${rankColor.border} ${index < 3 ? 'bg-gradient-to-r from-slate-50 to-white' : 'bg-slate-50'} hover:shadow-sm transition-all`}>
                  <div className="flex items-center space-x-3 flex-1">
                    <span className={`text-xs font-bold ${rankColor.bg} ${rankColor.text} w-7 h-7 rounded-full flex items-center justify-center`}>
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category || 'Không có danh mục'}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-slate-900">{product.quantity} món</p>
                    <p className="text-xs text-emerald-600 font-medium">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(OverviewTab);

