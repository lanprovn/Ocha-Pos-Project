import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type {
  Shift,
  CreateShiftInput,
  CloseShiftInput,
  UpdateShiftInput,
  ShiftFilters,
  ShiftSummary,
  ShiftPaginationResponse,
} from '../types/shift';

export const shiftService = {
  /**
   * Get all shifts with optional filters
   */
  async getAll(filters?: ShiftFilters): Promise<Shift[] | ShiftPaginationResponse> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.SHIFTS}?${queryString}` : API_ENDPOINTS.SHIFTS;
    return apiClient.get<Shift[] | ShiftPaginationResponse>(url);
  },

  /**
   * Get shift by ID
   */
  async getById(id: string): Promise<Shift> {
    return apiClient.get<Shift>(API_ENDPOINTS.SHIFT_BY_ID(id));
  },

  /**
   * Get current open shift
   */
  async getCurrentOpen(): Promise<Shift | null> {
    try {
      return await apiClient.get<Shift>(API_ENDPOINTS.SHIFTS_CURRENT);
    } catch (error: any) {
      // 404 means no shift is open, which is normal - return null instead of throwing
      if (error?.response?.status === 404 || error?.message?.includes('404') || error?.message?.includes('NO_OPEN_SHIFT')) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get shift summary with statistics
   */
  async getSummary(id: string): Promise<ShiftSummary> {
    return apiClient.get<ShiftSummary>(API_ENDPOINTS.SHIFT_SUMMARY(id));
  },

  /**
   * Create new shift (open shift)
   */
  async create(data: CreateShiftInput): Promise<Shift> {
    return apiClient.post<Shift>(API_ENDPOINTS.SHIFTS, data);
  },

  /**
   * Auto-open shift for staff (check-in)
   * Automatically opens shift with opening cash when staff logs in
   */
  async autoOpen(data?: { openingCash?: number; notes?: string | null }): Promise<Shift> {
    return apiClient.post<Shift>(API_ENDPOINTS.SHIFTS_AUTO_OPEN, data || {});
  },

  /**
   * Close shift
   */
  async close(id: string, data: CloseShiftInput): Promise<Shift> {
    return apiClient.put<Shift>(API_ENDPOINTS.SHIFT_CLOSE(id), data);
  },

  /**
   * Update shift
   */
  async update(id: string, data: UpdateShiftInput): Promise<Shift> {
    return apiClient.put<Shift>(API_ENDPOINTS.SHIFT_BY_ID(id), data);
  },

  /**
   * Delete shift
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.SHIFT_BY_ID(id));
  },
};

export default shiftService;

