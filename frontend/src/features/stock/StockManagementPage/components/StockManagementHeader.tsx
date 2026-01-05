import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeButton from '@components/ui/HomeButton';

export const StockManagementHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b border-gray-300 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Tồn Kho</h1>
              <p className="text-sm text-gray-600">Theo dõi và quản lý tồn kho sản phẩm</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <HomeButton size="md" />
          </div>
        </div>
      </div>
    </div>
  );
};

