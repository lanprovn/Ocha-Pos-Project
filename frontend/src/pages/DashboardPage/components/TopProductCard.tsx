import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface TopProductCardProps {
  stats: DashboardStats | null;
}

export const TopProductCard: React.FC<TopProductCardProps> = ({ stats }) => {
  const topProduct = stats?.topProducts[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div>
        <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Sản Phẩm Hot</p>
        <p className="text-lg font-bold text-slate-900 mb-1">
          {topProduct?.name || 'Chưa có'}
        </p>
        <p className="text-sm text-slate-600 mt-1 font-medium">
          {topProduct?.quantity || 0} đơn • {formatCurrency(topProduct?.revenue || 0)}
        </p>
      </div>
    </div>
  );
};

