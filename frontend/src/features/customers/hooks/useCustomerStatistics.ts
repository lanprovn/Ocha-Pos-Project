import { useState, useEffect, useCallback } from 'react';
import customerService from '@features/customers/services/customer.service';
import type { CustomerStatistics } from '@/types/customer';

export const useCustomerStatistics = () => {
  const [statistics, setStatistics] = useState<CustomerStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await customerService.getStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thống kê khách hàng');
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    statistics,
    isLoading,
    error,
    reload: loadStatistics,
  };
};

