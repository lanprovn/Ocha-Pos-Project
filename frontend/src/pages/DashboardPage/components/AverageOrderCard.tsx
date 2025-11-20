import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface AverageOrderCardProps {
  stats: DashboardStats | null;
}

export const AverageOrderCard: React.FC<AverageOrderCardProps> = ({ stats }) => {
  const averageValue = stats?.overview.averageOrderValue ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div>
        <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Giá Trị TB/Đơn</p>
        <p className="text-3xl font-bold text-slate-900 mb-1">
          {formatCurrency(averageValue)}
        </p>
      </div>
    </div>
  );
};

