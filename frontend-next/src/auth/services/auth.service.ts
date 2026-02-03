"use client";
import apiClient from '@lib/api.service';

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
    return apiClient.post<LoginResponse>('/users/login', data);
  },

  // Get current user
  async getMe(): Promise<User> {
    return apiClient.get<User>('/users/me');
  },

  // Logout (just clear token)
  logout(): void {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('roleContext'); // Role context for this tab
  },

  // Save token and user
  saveAuth(token: string, user: LoginResponse['user'], roleContext?: 'STAFF' | 'ADMIN'): void {
    // Save to sessionStorage for this tab
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    if (roleContext) {
      sessionStorage.setItem('roleContext', roleContext);
    }
    
    // Also save to localStorage for API calls (shared across tabs)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get token (prefer sessionStorage, fallback to localStorage)
  getToken(): string | null {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  },

  // Get user from sessionStorage (this tab's context)
  getUser(): LoginResponse['user'] | null {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Get role context for this tab
  getRoleContext(): 'STAFF' | 'ADMIN' | null {
    return sessionStorage.getItem('roleContext') as 'STAFF' | 'ADMIN' | null;
  },

  // Set role context for this tab
  setRoleContext(role: 'STAFF' | 'ADMIN'): void {
    sessionStorage.setItem('roleContext', role);
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

