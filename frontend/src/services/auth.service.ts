import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const authService = {
  // Login
  async login(data: LoginInput): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, data);
  },

  // Get current user
  async getMe(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH_ME);
  },

  // Logout (just clear token)
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Save token and user
  saveAuth(token: string, user: LoginResponse['user']): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Get user from localStorage
  getUser(): LoginResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

