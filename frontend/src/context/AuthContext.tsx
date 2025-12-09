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

      // Get role context for this tab
      const roleContext = authService.getRoleContext();
      
      // If no role context, check localStorage user but don't auto-set
      const savedUser = authService.getUser();
      
      if (savedUser && roleContext) {
        // This tab has its own context
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
          
          // Only set if no role context exists (new tab, not from another tab)
          if (!roleContext) {
            setUser(userInfo);
            authService.saveAuth(token, userInfo);
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

