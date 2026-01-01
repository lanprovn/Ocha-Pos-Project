import apiClient from './api.service';

export type UserRole = 'ADMIN' | 'STAFF';

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateStaffInput {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface StaffFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface StaffResponse {
  users: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StaffStatistics {
  total: number;
  byRole: {
    admin: number;
    staff: number;
  };
  byStatus: {
    active: number;
    inactive: number;
  };
}

export const staffService = {
  /**
   * Get all staff/users with filters
   */
  async getAll(filters?: StaffFilters): Promise<StaffResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    return apiClient.get<StaffResponse>(url);
  },

  /**
   * Get staff/user by ID
   */
  async getById(id: string): Promise<Staff> {
    return apiClient.get<Staff>(`/users/${id}`);
  },

  /**
   * Create new staff/user
   */
  async create(data: CreateStaffInput): Promise<Staff> {
    return apiClient.post<Staff>('/users', data);
  },

  /**
   * Update staff/user
   */
  async update(id: string, data: UpdateStaffInput): Promise<Staff> {
    return apiClient.patch<Staff>(`/users/${id}`, data);
  },

  /**
   * Delete staff/user (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },

  /**
   * Get staff statistics
   */
  async getStatistics(): Promise<StaffStatistics> {
    return apiClient.get<StaffStatistics>('/users/statistics');
  },
};

