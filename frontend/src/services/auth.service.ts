import apiClient from './api.service';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const authService = {
  // Login
  async login(data: LoginInput): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`${API_BASE_URL}/users/login`, data);
  },

  // Get current user
  async getMe(): Promise<User> {
    return apiClient.get<User>(`${API_BASE_URL}/users/me`);
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

