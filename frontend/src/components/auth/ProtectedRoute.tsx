import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants';

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

  // Check if route requires specific role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    if (user?.role === 'ADMIN') {
      return <Navigate to={`${ROUTES.ADMIN_DASHBOARD}?tab=overview`} replace />;
    }
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Block admin from accessing staff-only routes (POS, Checkout, Orders, Analytics)
  if (!requiredRole && user?.role === 'ADMIN') {
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

  // Block staff from accessing admin-only routes
  if (user?.role === 'STAFF' && location.pathname === ROUTES.ADMIN_DASHBOARD) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

