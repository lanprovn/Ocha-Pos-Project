"use client";
import { useState, useEffect, useCallback } from 'react';
import customerService from '@features/customers/services/customer.service';

export const useCustomerTags = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const availableTags = await customerService.getAvailableTags();
      setTags(availableTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách tags');
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    isLoading,
    error,
    reloadTags: loadTags,
  };
};

