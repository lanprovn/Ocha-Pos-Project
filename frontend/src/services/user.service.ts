import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'STAFF';
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: 'ADMIN' | 'STAFF';
  isActive?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordInput {
  email: string;
  newPassword: string;
}

class UserService {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>(API_ENDPOINTS.USERS);
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    return apiClient.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  }

  /**
   * Create new user
   */
  async create(data: CreateUserInput): Promise<User> {
    return apiClient.post<User>(API_ENDPOINTS.USERS, data);
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserInput): Promise<User> {
    return apiClient.patch<User>(`${API_ENDPOINTS.USERS}/${id}`, data);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.USERS}/${id}`);
  }

  /**
   * Change password
   */
  async changePassword(id: string, data: ChangePasswordInput): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`${API_ENDPOINTS.USERS}/${id}/password`, data);
  }

  /**
   * Reset password (Admin only)
   */
  async resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${API_ENDPOINTS.USERS}/reset-password`, data);
  }
}

export default new UserService();

