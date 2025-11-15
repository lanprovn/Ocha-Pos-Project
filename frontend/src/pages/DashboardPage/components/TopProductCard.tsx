import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface TopProductCardProps {
  stats: DashboardStats | null;
}

export const TopProductCard: React.FC<TopProductCardProps> = ({ stats }) => {
  const topProduct = stats?.topProducts[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Sản Phẩm Hot</p>
          <p className="text-lg font-bold text-gray-900">
            {topProduct?.name || 'Chưa có'}
          </p>
          <p className="text-sm text-gray-500">
            {topProduct?.quantity || 0} đơn • {formatCurrency(topProduct?.revenue || 0)}
          </p>
        </div>
        <div className="p-3 bg-orange-100 rounded-full">
          🔥
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm text-orange-600">
        📅
        <span className="ml-1">Hôm nay</span>
      </div>
    </div>
  );
};

