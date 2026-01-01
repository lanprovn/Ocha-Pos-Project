import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginInput, type LoginResponse } from '../services/auth.service';
import { ROUTES } from '@constants';
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
  const navigate = useNavigate();

  // Check authentication on mount
  const checkAuth = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Get role context for this tab (from sessionStorage - tab-specific)
      const roleContext = authService.getRoleContext();
      
      // Get user from sessionStorage (this tab's context)
      const savedUser = authService.getUser();
      
      // CRITICAL: If this tab has no roleContext, it's a new tab
      // Don't auto-login from localStorage to prevent multi-tab conflicts
      if (!roleContext) {
        // New tab detected - clear any stale sessionStorage data
        // User must login again or explicitly choose role
        console.log('🆕 New tab detected - requiring explicit login');
        setIsLoading(false);
        return; // Don't auto-set user, require login
      }
      
      // This tab has a roleContext, verify it matches
      if (savedUser && roleContext) {
        // Verify token is still valid
        try {
          const userData = await authService.getMe();
          if (userData && userData.role === savedUser.role) {
            // Token valid and role matches
            setUser(savedUser);
          } else {
            // Role mismatch or token invalid - clear and require re-login
            console.warn('⚠️ Role mismatch detected, clearing auth');
            authService.logout();
            setUser(null);
          }
        } catch (error) {
          // Token invalid
          authService.logout();
          setUser(null);
        }
      } else {
        // No saved user but has roleContext - shouldn't happen, but clear it
        authService.logout();
        setUser(null);
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

      // For STAFF: Don't navigate yet - LoginPage will handle shift modal
      // For ADMIN: Navigate immediately
      if (response.user.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      }
      // STAFF navigation will be handled by LoginPage after shift modal
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
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

