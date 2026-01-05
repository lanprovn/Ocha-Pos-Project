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

  // Memoize status sections to prevent recalculation
  const statusSections = useMemo(() => 
    getStatusSections(filteredGroupedOrders),
    [filteredGroupedOrders]
  );

  // Memoize handlers to prevent re-renders
  const handleOpenOrdersPage = useCallback(() => {
    navigate(ROUTES.ORDERS);
  }, [navigate]);

  // Calculate stats
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng Đơn Hàng</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100/50 rounded-lg border-l-4 border-amber-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-amber-700 mb-3 font-medium uppercase tracking-wide">Chờ Xử Lý</p>
          <p className="text-2xl font-bold text-amber-900">{stats.pendingOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-100/50 rounded-lg border-l-4 border-indigo-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-indigo-700 mb-3 font-medium uppercase tracking-wide">Đang Chuẩn Bị</p>
          <p className="text-2xl font-bold text-indigo-900">{stats.preparingOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-lg border-l-4 border-emerald-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-emerald-700 mb-3 font-medium uppercase tracking-wide">Doanh Thu</p>
          <p className="text-2xl font-bold text-emerald-900">
            {formatPrice(stats.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Trang Quản Lý Đơn Hàng Đầy Đủ
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Mở trang quản lý đơn hàng với đầy đủ tính năng: xem tất cả đơn hàng, 
              cập nhật trạng thái, tìm kiếm và lọc đơn hàng theo nhiều tiêu chí.
            </p>
            <button
              onClick={handleOpenOrdersPage}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold shadow-sm hover:shadow-md text-sm group"
            >
              <span>Mở Trang Đơn Hàng</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Display */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Đơn Hàng Hôm Nay</h3>
            <div className="text-sm text-slate-500">
              {currentTime.toLocaleString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          
          {/* Filters */}
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

        {/* Orders List */}
        <div className="p-5">
          {filteredOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {statusSections.map((section) => (
                <OrderStatusSection
                  key={section.key}
                  section={section}
                  currentTime={currentTime}
                  sectionRef={section.key === 'completed' ? completedSectionRef : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrderManagementTab);
