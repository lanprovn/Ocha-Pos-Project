"use client";
import { useState, useEffect, useCallback } from 'react';
import customerService from '@features/customers/services/customer.service';
import type {
  Customer,
  CustomerDetail,
  CustomerFilters,
  MembershipLevel,
} from '@/types/customer';

interface UseCustomersOptions {
  page?: number;
  limit?: number;
}

export const useCustomers = (options: UseCustomersOptions = {}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<CustomerFilters & { page?: number; limit?: number }>({
    page: options.page || 1,
    limit: options.limit || 10,
  });

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await customerService.getAll(filters);
      setCustomers(response.customers);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách khách hàng');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadCustomerDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const customer = await customerService.getById(id);
      setSelectedCustomer(customer);
      return customer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin khách hàng');
      setSelectedCustomer(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<CustomerFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setSearchQuery = useCallback((search: string) => {
    updateFilters({ search: search || undefined });
  }, [updateFilters]);

  const setMembershipLevelFilter = useCallback((level: MembershipLevel | undefined) => {
    updateFilters({ membershipLevel: level });
  }, [updateFilters]);

  const setTagsFilter = useCallback((tags: string[]) => {
    updateFilters({ tags: tags.length > 0 ? tags : undefined });
  }, [updateFilters]);

  const setIsActiveFilter = useCallback((isActive: boolean | undefined) => {
    updateFilters({ isActive });
  }, [updateFilters]);

  const updateCustomer = useCallback(async (
    id: string,
    data: {
      name?: string;
      phone?: string;
      email?: string | null;
      address?: string | null;
      dateOfBirth?: string | null;
      gender?: string | null;
      notes?: string | null;
      tags?: string[];
      membershipLevel?: MembershipLevel;
      isActive?: boolean;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedCustomer = await customerService.update(id, data);
      
      // Update selected customer if it's the one being updated
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(updatedCustomer);
      }
      
      // Refresh customer list
      await loadCustomers();
      
      return updatedCustomer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật thông tin khách hàng';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedCustomer, loadCustomers]);

  const adjustLoyaltyPoints = useCallback(async (
    id: string,
    points: number,
    reason: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedCustomer = await customerService.adjustLoyaltyPoints(id, points, reason);
      
      // Update selected customer if it's the one being updated
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(updatedCustomer);
      }
      
      // Refresh customer list
      await loadCustomers();
      
      return updatedCustomer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể điều chỉnh điểm tích lũy';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedCustomer, loadCustomers]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return {
    customers,
    selectedCustomer,
    isLoading,
    error,
    pagination,
    filters,
    loadCustomers,
    loadCustomerDetail,
    updateCustomer,
    adjustLoyaltyPoints,
    updateFilters,
    setPage,
    setSearchQuery,
    setMembershipLevelFilter,
    setTagsFilter,
    setIsActiveFilter,
    clearSelectedCustomer: () => setSelectedCustomer(null),
  };
};

