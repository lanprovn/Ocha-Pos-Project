"use client";
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, type LoginInput, type LoginResponse } from '../services/auth.service';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import toast from 'react-hot-toast';

export interface AuthContextType {
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput, role: 'STAFF' | 'ADMIN') => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useRouter();

  // Check authentication on mount
  // Only restore session if user logged in THIS tab (has roleContext in sessionStorage)
  // This prevents auto-login when opening the app
  const checkAuth = useCallback(async () => {
    try {
      // Get role context for this tab - only restore if user logged in THIS tab
      const roleContext = authService.getRoleContext();
      
      // If no role context, user hasn't logged in this tab - clear any stale data and don't auto-login
      if (!roleContext) {
        // Clear sessionStorage to ensure fresh start (but keep localStorage for API calls if needed)
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setIsLoading(false);
        return;
      }

      // Only restore session if there's a roleContext (user logged in this tab)
      const token = authService.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const savedUser = authService.getUser();
      
      if (savedUser && roleContext) {
        // This tab has its own context - restore session
        setUser(savedUser);
      } else {
        // Verify token by getting user info
        const userData = await authService.getMe();
        if (userData) {
          const userInfo = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          };
          
          // Only set if role context exists (user logged in this tab)
          if (roleContext) {
            setUser(userInfo);
            authService.saveAuth(token, userInfo, roleContext);
          }
        }
      }
    } catch (error) {
      // Token invalid, clear auth
      authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (data: LoginInput, role: 'STAFF' | 'ADMIN') => {
    try {
      const response = await authService.login(data);
      
      // Verify role matches
      if (response.user.role !== role) {
        throw new Error(`Bạn không có quyền đăng nhập với vai trò ${role === 'STAFF' ? 'Nhân viên' : 'Quản trị viên'}`);
      }

      // Save auth with role context
      authService.saveAuth(response.token, response.user, role);
      setUser(response.user);

      toast.success(`Đăng nhập thành công! Chào mừng ${response.user.name}`);

      // Redirect based on role
      if (response.user.role === 'ADMIN') {
        navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=overview`);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    
    // Clear cart data khi logout
    sessionStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.CART);
    
    navigate('/login');
    toast.success('Đã đăng xuất');
  }, [navigate]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

