import apiClient from '@lib/api.service';
import { API_ENDPOINTS } from '@/config/api';
import type {
  User,
  UserListResponse,
  UserFilters,
  CreateUserInput,
  UpdateUserInput,
} from '@/types/user';

export const userService = {
  /**
   * Get all users with filters and pagination
   */
  async getAll(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.USERS}?${queryString}` : API_ENDPOINTS.USERS;
    
    return apiClient.get<UserListResponse>(url);
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.USER_BY_ID(id));
  },

  /**
   * Create new user
   */
  async create(data: CreateUserInput): Promise<User> {
    return apiClient.post<User>(API_ENDPOINTS.USERS, data);
  },

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserInput): Promise<User> {
    return apiClient.patch<User>(API_ENDPOINTS.USER_BY_ID(id), data);
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.USER_BY_ID(id));
  },

  /**
   * Toggle user active status
   */
  async toggleActive(id: string): Promise<User> {
    return apiClient.patch<User>(API_ENDPOINTS.USER_TOGGLE_ACTIVE(id), {});
  },

  /**
   * Reset user password
   */
  async resetPassword(id: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.patch<{ message: string }>(API_ENDPOINTS.USER_RESET_PASSWORD(id), {
      newPassword,
    });
  },
};
