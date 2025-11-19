import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderDisplay } from '../../OrderDisplayPage/hooks/useOrderDisplay';
import { OrderDisplayHeader } from '../../OrderDisplayPage/components/OrderDisplayHeader';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(query) ||
          order.customerInfo?.name?.toLowerCase().includes(query) ||
          order.customerInfo?.phone?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.backendStatus === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.timestamp).toDateString();
        return orderDate === filterDate;
      });
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter((order) => {
        const method = order.paymentMethod?.toUpperCase();
        return method === paymentMethodFilter;
      });
    }

    return filtered;
  }, [allOrders, searchQuery, statusFilter, dateFilter, paymentMethodFilter]);

  // Re-group filtered orders
  const filteredGroupedOrders = useMemo(() => {
    const grouped: { [key: string]: any[] } = {
      creating: [],
      paid: [],
      preparing: [],
      completed: [],
    };

    filteredOrders.forEach((order) => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });

    return grouped;
  }, [filteredOrders]);

  // Memoize status sections to prevent recalculation
  const statusSections = useMemo(() => 
    getStatusSections(filteredGroupedOrders),
    [filteredGroupedOrders]
  );

  // Memoize handlers to prevent re-renders
  const handleOpenOrdersPage = useCallback(() => {
    navigate(ROUTES.ORDERS);
  }, [navigate]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleDateFilterChange = useCallback((value: string) => {
    setDateFilter(value);
  }, []);

  const handlePaymentMethodFilterChange = useCallback((value: string) => {
    setPaymentMethodFilter(value);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.backendStatus === 'PENDING' || o.backendStatus === 'CREATING').length;
    const preparingOrders = allOrders.filter(o => o.backendStatus === 'PREPARING').length;
    const completedOrders = allOrders.filter(o => o.backendStatus === 'COMPLETED').length;
    const cancelledOrders = allOrders.filter(o => o.backendStatus === 'CANCELLED').length;
    const totalRevenue = allOrders
      .filter(o => o.backendStatus === 'COMPLETED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Đơn Hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <DocumentChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Chờ Xử Lý</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đang Chuẩn Bị</p>
              <p className="text-2xl font-bold text-orange-600">{stats.preparingOrders}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <CheckCircleIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Doanh Thu</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Trang Quản Lý Đơn Hàng Đầy Đủ
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Mở trang quản lý đơn hàng với đầy đủ tính năng: xem tất cả đơn hàng, 
              cập nhật trạng thái, tìm kiếm và lọc đơn hàng theo nhiều tiêu chí.
            </p>
            <button
              onClick={handleOpenOrdersPage}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md text-sm"
            >
              <span>Mở Trang Đơn Hàng</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Đơn Hàng Hôm Nay</h3>
            <div className="text-sm text-gray-500">
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
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            statusFilter={statusFilter}
            setStatusFilter={handleStatusFilterChange}
            dateFilter={dateFilter}
            setDateFilter={handleDateFilterChange}
            paymentMethodFilter={paymentMethodFilter}
            setPaymentMethodFilter={handlePaymentMethodFilterChange}
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
