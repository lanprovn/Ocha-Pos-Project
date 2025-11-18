import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '@constants';
import { useAuth } from '@hooks/useAuth';

interface HomeButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const HomeButton: React.FC<HomeButtonProps> = ({ 
  className = '',
  size = 'md'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine home route based on user role and current location
  const isCustomerPage = location.pathname.startsWith(ROUTES.CUSTOMER);
  const isAdmin = user?.role === 'ADMIN';
  
  const homeRoute = isCustomerPage 
    ? ROUTES.CUSTOMER 
    : isAdmin 
      ? `${ROUTES.ADMIN_DASHBOARD}?tab=overview`
      : ROUTES.HOME;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={() => navigate(homeRoute)}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        bg-orange-600 hover:bg-orange-700
        text-white rounded-full
        shadow-md hover:shadow-lg
        transition-all duration-200
        hover:scale-110
        active:scale-95
        ${className}
      `}
      title="Về trang chủ"
      aria-label="Về trang chủ"
    >
      <HomeIcon className={iconSizes[size]} />
    </button>
  );
};

export default HomeButton;

