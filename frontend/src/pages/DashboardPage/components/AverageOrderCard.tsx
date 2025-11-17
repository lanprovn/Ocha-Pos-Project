import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface AverageOrderCardProps {
  stats: DashboardStats | null;
}

export const AverageOrderCard: React.FC<AverageOrderCardProps> = ({ stats }) => {
  const averageValue = stats?.overview.averageOrderValue ?? 0;

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6 border-l-4 border-l-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">Giá Trị TB/Đơn</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(averageValue)}
          </p>
        </div>
        <div className="p-3 bg-slate-100 rounded-md ml-4">
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

