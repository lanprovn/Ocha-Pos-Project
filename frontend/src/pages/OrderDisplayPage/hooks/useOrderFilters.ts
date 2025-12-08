import { useState, useMemo, useCallback } from 'react';
import type { OrderTracking, GroupedOrders } from '../types';

export interface OrderFiltersState {
  searchQuery: string;
  statusFilter: string;
  dateFilter: string;
  paymentMethodFilter: string;
}

export interface UseOrderFiltersReturn {
  filters: OrderFiltersState;
  setSearchQuery: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setDateFilter: (value: string) => void;
  setPaymentMethodFilter: (value: string) => void;
  filteredOrders: OrderTracking[];
  filteredGroupedOrders: GroupedOrders;
}

/**
 * Custom hook for filtering orders
 * Extracts common filter logic shared between OrderDisplayPage and OrderManagementTab
 */
export const useOrderFilters = (allOrders: OrderTracking[]): UseOrderFiltersReturn => {
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
  const filteredGroupedOrders = useMemo<GroupedOrders>(() => {
    const grouped: GroupedOrders = {
      creating: [],
      paid: [],
      preparing: [],
      completed: [],
    };

    filteredOrders.forEach((order) => {
      if (order.status && order.status in grouped) {
        grouped[order.status as keyof GroupedOrders].push(order);
      }
    });

    return grouped;
  }, [filteredOrders]);

  return {
    filters: {
      searchQuery,
      statusFilter,
      dateFilter,
      paymentMethodFilter,
    },
    setSearchQuery: useCallback((value: string) => setSearchQuery(value), []),
    setStatusFilter: useCallback((value: string) => setStatusFilter(value), []),
    setDateFilter: useCallback((value: string) => setDateFilter(value), []),
    setPaymentMethodFilter: useCallback((value: string) => setPaymentMethodFilter(value), []),
    filteredOrders,
    filteredGroupedOrders,
  };
};

