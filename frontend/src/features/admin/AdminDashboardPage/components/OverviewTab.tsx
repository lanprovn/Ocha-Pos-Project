import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { dashboardService, type DashboardStats, type DashboardDailySales } from '@features/dashboard/services/dashboard.service';
import { useCustomerStatistics } from '@features/customers/hooks/useCustomerStatistics';
import { formatPrice } from '@/utils/formatPrice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Layers,
  ShoppingCart,
  Users,
  AlertTriangle,
  DollarSign,
  CreditCard,
  QrCode,
  Wallet,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [yesterdaySales, setYesterdaySales] = useState<DashboardDailySales | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { statistics: customerStats } = useCustomerStatistics();

  const isLoadingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getYesterdayISO = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    const loadStats = async (isBackgroundRefresh = false) => {
      if (isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;
        if (!isBackgroundRefresh) setIsInitialLoading(true);
        else setIsRefreshing(true);

        const [data, yesterdayData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getDailySales(getYesterdayISO()),
        ]);

        setStats(data);
        setYesterdaySales(yesterdayData);
        hasLoadedRef.current = true;
      } catch (error) {
        if (!hasLoadedRef.current) {
          setStats(null);
          setYesterdaySales(null);
        }
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        isLoadingRef.current = false;
      }
    };

    if (intervalRef.current) clearInterval(intervalRef.current);
    loadStats(false);

    intervalRef.current = setInterval(() => {
      if (hasLoadedRef.current && !isLoadingRef.current) loadStats(true);
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [getYesterdayISO]);

  const { lowStockCount, outOfStockCount } = useMemo(() => {
    if (!stats?.lowStock) return { lowStockCount: 0, outOfStockCount: 0 };

    const lowStockProducts = stats.lowStock.products?.filter((p) => p.quantity > 0 && p.quantity <= p.minStock).length || 0;
    const lowStockIngredients = stats.lowStock.ingredients?.filter((i) => i.quantity > 0 && i.quantity <= i.minStock).length || 0;
    const outOfStockProducts = stats.lowStock.products?.filter((p) => p.quantity === 0).length || 0;
    const outOfStockIngredients = stats.lowStock.ingredients?.filter((i) => i.quantity === 0).length || 0;

    return {
      lowStockCount: lowStockProducts + lowStockIngredients,
      outOfStockCount: outOfStockProducts + outOfStockIngredients,
    };
  }, [stats?.lowStock]);

  const comparisonData = useMemo(() => {
    if (!stats || !yesterdaySales) return null;

    const todayRevenue = stats.overview.todayRevenue || 0;
    const yesterdayRevenue = yesterdaySales.totalRevenue || 0;
    const todayOrders = stats.overview.todayOrders || 0;
    const yesterdayOrders = yesterdaySales.totalOrders || 0;

    const revenueDiff = todayRevenue - yesterdayRevenue;
    const revenuePercent = yesterdayRevenue > 0 ? (revenueDiff / yesterdayRevenue) * 100 : 0;
    const ordersDiff = todayOrders - yesterdayOrders;
    const ordersPercent = yesterdayOrders > 0 ? (ordersDiff / yesterdayOrders) * 100 : 0;

    return { revenueDiff, revenuePercent, ordersDiff, ordersPercent };
  }, [stats, yesterdaySales]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Define Status Config
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
    CREATING: { label: 'Đang tạo', variant: 'outline' },
    PENDING: { label: 'Chờ xử lý', variant: 'warning' },
    CONFIRMED: { label: 'Đã xác nhận', variant: 'secondary' },
    PREPARING: { label: 'Đang chuẩn bị', variant: 'secondary' },
    READY: { label: 'Sẵn sàng', variant: 'success' },
    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
    CANCELLED: { label: 'Đã hủy', variant: 'destructive' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
          <p className="text-muted-foreground text-sm">
            {currentTime.toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {isRefreshing && (
          <Badge variant="outline" className="animate-pulse">
            Đang cập nhật...
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh Thu Hôm Nay</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {stats?.overview.todayRevenue ? formatPrice(stats.overview.todayRevenue) : '0₫'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {comparisonData && (
                <span className={comparisonData.revenuePercent >= 0 ? "text-green-600 flex items-center" : "text-red-600 flex items-center"}>
                  {comparisonData.revenuePercent >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(comparisonData.revenuePercent).toFixed(1)}%
                </span>
              )}
              so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn Hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.overview.totalOrders.toLocaleString('vi-VN') || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {stats?.overview.todayOrders || 0} đơn hôm nay
              {comparisonData && (
                <span className={cn("ml-1", comparisonData.ordersDiff >= 0 ? "text-green-600" : "text-red-600")}>
                  ({comparisonData.ordersDiff >= 0 ? '+' : ''}{comparisonData.ordersDiff})
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách Hàng</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {customerStats?.overview.totalCustomers.toLocaleString('vi-VN') || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {customerStats?.overview.vipCustomersCount || 0} khách hàng VIP
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh Báo Kho</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {(lowStockCount + outOfStockCount).toLocaleString('vi-VN')}
            </div>
            <div className="flex gap-2 mt-1">
              <Badge variant="warning" className="text-[10px] h-5 px-1.5 font-normal">
                {lowStockCount} thấp
              </Badge>
              <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-normal">
                {outOfStockCount} hết
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Đơn Hàng Gần Đây</CardTitle>
            <CardDescription>
              {stats?.recentOrders?.length || 0} đơn hàng mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.slice(0, 5).map((order) => {
                const config = statusConfig[order.status] || { label: order.status, variant: 'outline' };
                return (
                  <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">#{order.orderNumber}</span>
                        <Badge variant={config.variant} className="text-[10px] h-5 px-1.5">
                          {config.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        <span>•</span>
                        <span>{order.customerName || 'Khách lẻ'}</span>
                      </div>
                    </div>
                    <div className="font-bold text-sm">
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" className="w-full text-xs h-8 mt-2" onClick={() => navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=orders`)}>
                Xem tất cả <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Thanh Toán</CardTitle>
            <CardDescription>Phân bố phương thức trong ngày</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.paymentStats && Object.entries(stats.paymentStats).map(([method, data]) => {
              const icons = {
                cash: { icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50', name: 'Tiền mặt' },
                card: { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50', name: 'Thẻ' },
                qr: { icon: QrCode, color: 'text-purple-500', bg: 'bg-purple-50', name: 'QR Code' }
              };
              const config = icons[method as keyof typeof icons] || icons.cash;
              const Icon = config.icon;

              return (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{config.name}</p>
                      <p className="text-xs text-muted-foreground">{data.count} giao dịch</p>
                    </div>
                  </div>
                  <div className="font-semibold text-sm">
                    {formatPrice(data.revenue)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'Menu', desc: 'Quản lý 53 món', icon: Package, href: 'menu', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { name: 'Kho', desc: 'Sắp hết: ' + lowStockCount, icon: Layers, href: 'stock', color: 'text-amber-600', bg: 'bg-amber-50' },
          { name: 'Nhân viên', desc: 'Quản lý nhân sự', icon: Users, href: 'users', color: 'text-cyan-600', bg: 'bg-cyan-50' },
          { name: 'Báo cáo', desc: 'Xem chi tiết', icon: TrendingUp, href: 'analytics', color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.name}
              className="cursor-pointer hover:shadow-md transition-all border-none bg-slate-50/50 hover:bg-white"
              onClick={() => navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=${item.href}`)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-full ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
};

export default React.memo(OverviewTab);
