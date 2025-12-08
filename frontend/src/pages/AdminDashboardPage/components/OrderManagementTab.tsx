import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderDisplay } from '../../OrderDisplayPage/hooks/useOrderDisplay';
import { useOrderFilters } from '../../OrderDisplayPage/hooks/useOrderFilters';
import { OrderStatusSection } from '../../OrderDisplayPage/components/OrderStatusSection';
import OrderFilters from '../../OrderDisplayPage/components/OrderFilters';
import { EmptyState } from '../../../components/common/ui/EmptyState';
import { getStatusSections } from '../../OrderDisplayPage/utils/orderDisplayUtils';
import { ROUTES } from '../../../constants';
import {
  DocumentChartBarIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Tổng Đơn Hàng</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <DocumentChartBarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Chờ Xử Lý</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.pendingOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Đang Chuẩn Bị</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.preparingOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Doanh Thu</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
              Trang Quản Lý Đơn Hàng Đầy Đủ
            </h3>
            <p className="text-sm text-slate-600 mb-4 font-medium">
              Mở trang quản lý đơn hàng với đầy đủ tính năng: xem tất cả đơn hàng, 
              cập nhật trạng thái, tìm kiếm và lọc đơn hàng theo nhiều tiêu chí.
            </p>
            <button
              onClick={handleOpenOrdersPage}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-sm hover:shadow-md text-sm"
            >
              <span>Mở Trang Đơn Hàng</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Display */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Đơn Hàng Hôm Nay</h3>
            <div className="text-sm text-slate-500 font-medium">
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
        <div className="p-6">
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
