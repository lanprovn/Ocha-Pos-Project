import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface TopProductCardProps {
  stats: DashboardStats | null;
}

export const TopProductCard: React.FC<TopProductCardProps> = ({ stats }) => {
  const topProduct = stats?.topProducts[0];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-lg border-l-4 border-amber-500 p-5 hover:shadow-md transition-shadow">
      <p className="text-xs text-amber-700 mb-3 font-medium uppercase tracking-wide">Sản Phẩm Hot</p>
      <p className="text-lg font-bold text-amber-900 mb-1">
        {topProduct?.name || 'Chưa có'}
      </p>
      <p className="text-sm text-amber-700 mt-1 font-medium">
        {topProduct?.quantity || 0} đơn • {formatCurrency(topProduct?.revenue || 0)}
      </p>
    </div>
  );
};

