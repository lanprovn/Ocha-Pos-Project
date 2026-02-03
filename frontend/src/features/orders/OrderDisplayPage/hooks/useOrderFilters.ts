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

export const useOrderFilters = (allOrders: OrderTracking[]): UseOrderFiltersReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Single-Pass Filtering Algorithm for maximum performance
  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filterDate = dateFilter ? new Date(dateFilter).toDateString() : null;
    const payMethod = paymentMethodFilter.toUpperCase();

    // Loop once instead of multiple .filter() calls
    return allOrders.filter((order) => {
      // 1. Search Query Match
      if (query) {
        const matchesSearch =
          order.orderId?.toLowerCase().includes(query) ||
          order.customerInfo?.name?.toLowerCase().includes(query) ||
          order.customerInfo?.phone?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // 2. Status Match
      if (statusFilter !== 'all' && order.backendStatus !== statusFilter) {
        return false;
      }

      // 3. Date Match (Optimized: only compare strings)
      if (filterDate) {
        const orderDate = new Date(order.timestamp).toDateString();
        if (orderDate !== filterDate) return false;
      }

      // 4. Payment Method Match
      if (paymentMethodFilter !== 'all') {
        const method = order.paymentMethod?.toUpperCase();
        if (method !== payMethod) return false;
      }

      return true;
    });
  }, [allOrders, searchQuery, statusFilter, dateFilter, paymentMethodFilter]);

  // High-performance Grouping
  const filteredGroupedOrders = useMemo<GroupedOrders>(() => {
    const grouped: GroupedOrders = {
      creating: [],
      pending_verification: [],
      paid: [],
      preparing: [],
      completed: [],
      hold: [],
    };

    // Use for loop or forEach for faster execution on large arrays
    for (const order of filteredOrders) {
      const status = order.status as keyof GroupedOrders;
      if (status && grouped[status]) {
        grouped[status].push(order);
      }
    }

    return grouped;
  }, [filteredOrders]);

  return {
    filters: { searchQuery, statusFilter, dateFilter, paymentMethodFilter },
    setSearchQuery: useCallback((value: string) => setSearchQuery(value), []),
    setStatusFilter: useCallback((value: string) => setStatusFilter(value), []),
    setDateFilter: useCallback((value: string) => setDateFilter(value), []),
    setPaymentMethodFilter: useCallback((value: string) => setPaymentMethodFilter(value), []),
    filteredOrders,
    filteredGroupedOrders,
  };
};
