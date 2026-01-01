import { useState, useEffect, useCallback } from 'react';
import { shiftService } from '../services/shift.service';
import type { Shift } from '../types/shift';

/**
 * Hook to check shift status
 * Returns current open shift or null if no shift is open
 */
export const useShiftStatus = () => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  const checkShiftStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const shift = await shiftService.getCurrentOpen();
      setCurrentShift(shift);
      setHasChecked(true);
      return shift;
    } catch (err: any) {
      // 404 is expected when no shift is open
      if (err?.response?.status === 404 || err?.message?.includes('404')) {
        setCurrentShift(null);
        setHasChecked(true);
        return null;
      }
      // Other errors - log but don't show to user
      console.error('Error checking shift status:', err);
      setCurrentShift(null);
      setHasChecked(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkShiftStatus();
    // Check every 30 seconds
    const interval = setInterval(checkShiftStatus, 30000);
    return () => clearInterval(interval);
  }, [checkShiftStatus]);

  return {
    currentShift,
    isLoading,
    hasChecked,
    hasOpenShift: !!currentShift,
    refresh: checkShiftStatus,
  };
};



