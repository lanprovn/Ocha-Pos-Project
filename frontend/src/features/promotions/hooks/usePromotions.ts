import { useState, useEffect, useCallback, useRef } from 'react';
import promotionService from '@features/promotions/services/promotion.service';
import { subscribeToPromotions, subscribeToDashboard } from '@lib/socket.service';
import type {
  Promotion,
  PromotionFilters,
  CreatePromotionInput,
  UpdatePromotionInput,
  ValidatePromotionInput,
  ValidatePromotionResult,
} from '@features/promotions/services/promotion.service';

export const usePromotions = (filters?: PromotionFilters) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadPromotionsRef = useRef<() => Promise<void>>();

  const loadPromotions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await promotionService.getAll(filters || {});
      setPromotions(response.promotions);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách khuyến mãi');
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  loadPromotionsRef.current = loadPromotions;

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  // Socket.io listeners for real-time updates
  useEffect(() => {
    const handlePromotionCreated = (promotion: Promotion) => {
      setPromotions((prev) => [promotion, ...prev]);
    };

    const handlePromotionUpdated = (promotion: Promotion) => {
      setPromotions((prev) =>
        prev.map((p) => (p.id === promotion.id ? promotion : p))
      );
    };

    const handlePromotionDeleted = (data: { id: string }) => {
      setPromotions((prev) => prev.filter((p) => p.id !== data.id));
    };

    const handleDashboardUpdate = (data: any) => {
      if (
        data.type === 'promotion_created' ||
        data.type === 'promotion_updated' ||
        data.type === 'promotion_deleted'
      ) {
        loadPromotionsRef.current?.();
      }
    };

    const cleanup1 = subscribeToPromotions(
      handlePromotionCreated,
      handlePromotionUpdated,
      handlePromotionDeleted
    );

    const cleanup2 = subscribeToDashboard(handleDashboardUpdate);

    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  const createPromotion = useCallback(async (data: CreatePromotionInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newPromotion = await promotionService.create(data);
      setPromotions((prev) => [newPromotion, ...prev]);
      return newPromotion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo khuyến mãi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePromotion = useCallback(async (id: string, data: UpdatePromotionInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedPromotion = await promotionService.update(id, data);
      setPromotions((prev) =>
        prev.map((p) => (p.id === id ? updatedPromotion : p))
      );
      return updatedPromotion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật khuyến mãi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePromotion = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await promotionService.delete(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa khuyến mãi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validatePromotion = useCallback(async (input: ValidatePromotionInput): Promise<ValidatePromotionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await promotionService.validateAndApply(input);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xác thực khuyến mãi';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    promotions,
    isLoading,
    error,
    pagination,
    loadPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    validatePromotion,
  };
};

