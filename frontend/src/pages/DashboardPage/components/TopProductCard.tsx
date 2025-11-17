import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface TopProductCardProps {
  stats: DashboardStats | null;
}

export const TopProductCard: React.FC<TopProductCardProps> = ({ stats }) => {
  const topProduct = stats?.topProducts[0];

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6 border-l-4 border-l-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">Sản Phẩm Hot</p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {topProduct?.name || 'Chưa có'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {topProduct?.quantity || 0} đơn • {formatCurrency(topProduct?.revenue || 0)}
          </p>
        </div>
        <div className="p-3 bg-slate-100 rounded-md ml-4">
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

