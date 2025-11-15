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

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    if (user?.role === 'ADMIN') {
      return <Navigate to={ROUTES.STOCK_MANAGEMENT} replace />;
    }
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

