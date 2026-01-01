import { useState, useEffect, useCallback } from 'react';
import { shiftService } from '../services/shift.service';
import type {
  Shift,
  CreateShiftInput,
  CloseShiftInput,
  UpdateShiftInput,
  ShiftFilters,
  ShiftSummary,
} from '../types/shift';
import toast from 'react-hot-toast';

export const useShifts = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const loadShifts = useCallback(async (filters?: ShiftFilters) => {
    try {
      setIsLoading(true);
      const result = await shiftService.getAll(filters);
      
      if ('data' in result && 'pagination' in result) {
        // Paginated response
        setShifts(result.data);
        setPagination(result.pagination);
      } else {
        // Simple array response
        setShifts(result as Shift[]);
        setPagination(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải danh sách ca làm việc');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCurrentShift = useCallback(async () => {
    try {
      const shift = await shiftService.getCurrentOpen();
      setCurrentShift(shift);
      return shift;
    } catch (err: any) {
      // 404 is expected when no shift is open, don't show error toast
      if (err?.response?.status === 404 || err?.message?.includes('404')) {
        setCurrentShift(null);
        return null;
      }
      toast.error(err.message || 'Không thể tải ca làm việc hiện tại');
      return null;
    }
  }, []);

  const getShiftById = useCallback(async (id: string): Promise<Shift | null> => {
    try {
      const shift = await shiftService.getById(id);
      return shift;
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải thông tin ca làm việc');
      return null;
    }
  }, []);

  const getShiftSummary = useCallback(async (id: string): Promise<ShiftSummary | null> => {
    try {
      const summary = await shiftService.getSummary(id);
      return summary;
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải tổng kết ca làm việc');
      return null;
    }
  }, []);

  const createShift = useCallback(async (data: CreateShiftInput): Promise<Shift | null> => {
    try {
      const newShift = await shiftService.create(data);
      setShifts((prev) => [newShift, ...prev]);
      setCurrentShift(newShift);
      toast.success('Đã mở ca làm việc thành công');
      return newShift;
    } catch (err: any) {
      toast.error(err.message || 'Không thể mở ca làm việc');
      return null;
    }
  }, []);

  const closeShift = useCallback(async (id: string, data: CloseShiftInput): Promise<Shift | null> => {
    try {
      const closedShift = await shiftService.close(id, data);
      setShifts((prev) => prev.map((s) => (s.id === id ? closedShift : s)));
      if (currentShift?.id === id) {
        setCurrentShift(null);
      }
      toast.success('Đã đóng ca làm việc thành công');
      return closedShift;
    } catch (err: any) {
      toast.error(err.message || 'Không thể đóng ca làm việc');
      return null;
    }
  }, [currentShift]);

  const updateShift = useCallback(async (id: string, data: UpdateShiftInput): Promise<Shift | null> => {
    try {
      const updated = await shiftService.update(id, data);
      setShifts((prev) => prev.map((s) => (s.id === id ? updated : s)));
      if (currentShift?.id === id) {
        setCurrentShift(updated);
      }
      toast.success('Đã cập nhật ca làm việc thành công');
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật ca làm việc');
      return null;
    }
  }, [currentShift]);

  const deleteShift = useCallback(async (id: string): Promise<boolean> => {
    try {
      await shiftService.delete(id);
      setShifts((prev) => prev.filter((s) => s.id !== id));
      if (currentShift?.id === id) {
        setCurrentShift(null);
      }
      toast.success('Đã xóa ca làm việc thành công');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa ca làm việc');
      return false;
    }
  }, [currentShift]);

  useEffect(() => {
    loadShifts();
    loadCurrentShift();
  }, [loadShifts, loadCurrentShift]);

  return {
    shifts,
    currentShift,
    isLoading,
    pagination,
    loadShifts,
    loadCurrentShift,
    getShiftById,
    getShiftSummary,
    createShift,
    closeShift,
    updateShift,
    deleteShift,
  };
};

