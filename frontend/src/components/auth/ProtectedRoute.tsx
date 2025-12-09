import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants';
import { authService } from '@services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'STAFF' | 'ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Re-check auth when route changes
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [location.pathname, isAuthenticated, isLoading, checkAuth]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // Get role context for this tab
  const roleContext = authService.getRoleContext();

  // Check if route requires specific role
  if (requiredRole && user?.role !== requiredRole) {
    // Only redirect if role context matches required role
    // This prevents redirect when user from another tab is detected
    if (roleContext === requiredRole) {
      if (user?.role === 'ADMIN') {
        return <Navigate to={`${ROUTES.ADMIN_DASHBOARD}?tab=overview`} replace />;
      }
      return <Navigate to={ROUTES.HOME} replace />;
    }
    // If role context doesn't match, redirect to login
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Block admin from accessing staff-only routes (only if role context is ADMIN)
  if (!requiredRole && user?.role === 'ADMIN' && roleContext === 'ADMIN') {
    // These are staff-only routes, admin should not access them
    const staffOnlyRoutes = [
      ROUTES.HOME,
      ROUTES.CHECKOUT,
      ROUTES.ORDERS,
      ROUTES.ANALYTICS,
    ];
    
    if (staffOnlyRoutes.includes(location.pathname as any)) {
      return <Navigate to={`${ROUTES.ADMIN_DASHBOARD}?tab=overview`} replace />;
    }
  }

  // Block staff from accessing admin-only routes (only if role context is STAFF)
  if (user?.role === 'STAFF' && roleContext === 'STAFF' && location.pathname === ROUTES.ADMIN_DASHBOARD) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

