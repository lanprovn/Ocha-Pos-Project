import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderDisplay } from '@features/orders/OrderDisplayPage/hooks/useOrderDisplay';
import { useOrderFilters } from '@features/orders/OrderDisplayPage/hooks/useOrderFilters';
import { OrderStatusSection } from '@features/orders/OrderDisplayPage/components/OrderStatusSection';
import OrderFilters from '@features/orders/OrderDisplayPage/components/OrderFilters';
import { EmptyState } from '@components/ui/EmptyState';
import { getStatusSections } from '@features/orders/OrderDisplayPage/utils/orderDisplayUtils';
import { ROUTES } from '@/constants';
import { formatPrice } from '@/utils/formatPrice';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Clock,
  ChefHat,
  DollarSign,
  ExternalLink,
  Search,
  Calendar,
  AlertCircle
} from 'lucide-react';

const OrderManagementTab: React.FC = () => {
  const navigate = useNavigate();
  const { orders: allOrders, currentTime, completedSectionRef } = useOrderDisplay();
  const {
    filters,
    setSearchQuery,
    setStatusFilter,
    setDateFilter,
    setPaymentMethodFilter,
    filteredOrders,
    filteredGroupedOrders,
  } = useOrderFilters(allOrders);

  const statusSections = useMemo(() =>
    getStatusSections(filteredGroupedOrders),
    [filteredGroupedOrders]
  );

  const handleOpenOrdersPage = useCallback(() => {
    navigate(ROUTES.ORDERS);
  }, [navigate]);

  const stats = useMemo(() => {
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.backendStatus === 'PENDING' || o.backendStatus === 'CREATING').length;
    const preparingOrders = allOrders.filter(o => o.backendStatus === 'PREPARING').length;
    const completedOrders = allOrders.filter(o => o.backendStatus === 'COMPLETED').length;
    const cancelledOrders = allOrders.filter(o => o.backendStatus === 'CANCELLED').length;
    const totalRevenue = allOrders
      .filter(o => o.backendStatus === 'COMPLETED')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return {
      totalOrders,
      pendingOrders,
      preparingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    };
  }, [allOrders]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Đơn Hàng</h2>
          <p className="text-slate-500 text-sm">Theo dõi và xử lý các đơn hàng đang diễn ra</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Live Monitor</span>
          </div>
        </div>
      </div>

      {/* Luxury Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng Đơn', val: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Chờ Xử Lý', val: stats.pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Đang Chế Biến', val: stats.preparingOrders, icon: ChefHat, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Thực Thu', val: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm bg-white/60 backdrop-blur-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{item.val}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action Link */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-slate-900 to-indigo-950 text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-primary/20" />
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              <ExternalLink className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Kênh Xử Lý Đơn Hàng Tập Trung</h3>
              <p className="text-slate-400 text-sm">Mở giao diện tối ưu cho Tablet/PC để quản lý bếp và trả món chuyên nghiệp.</p>
            </div>
          </div>
          <Button
            onClick={handleOpenOrdersPage}
            className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary/20 whitespace-nowrap active:scale-95 transition-all"
          >
            Mở Dashboard Đơn Hàng
          </Button>
        </CardContent>
      </Card>

      {/* Filter and Content Area */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <CardTitle className="text-sm font-bold text-slate-700">Đơn Hàng Hôm Nay</CardTitle>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Today: {currentTime.toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-slate-200 text-slate-500 font-medium">
                {filteredOrders.length} hiển thị
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-8">
            <OrderFilters
              searchQuery={filters.searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={filters.statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={filters.dateFilter}
              setDateFilter={setDateFilter}
              paymentMethodFilter={filters.paymentMethodFilter}
              setPaymentMethodFilter={setPaymentMethodFilter}
            />
          </div>

          {/* Orders Content */}
          <div className="space-y-12">
            {filteredOrders.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center opacity-40">
                <AlertCircle className="w-16 h-16 mb-4" />
                <p className="font-bold text-lg">Không tìm thấy đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-10">
                {statusSections.map((section) => (
                  <div key={section.key} className="space-y-4">
                    <OrderStatusSection
                      section={section}
                      currentTime={currentTime}
                      sectionRef={section.key === 'completed' ? completedSectionRef : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer Support */}
      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-4">
        Ocha POS Real-time Sync Engine v1.0
      </p>
    </div>
  );
};

export default React.memo(OrderManagementTab);
