import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface AverageOrderCardProps {
  stats: DashboardStats | null;
}

export const AverageOrderCard: React.FC<AverageOrderCardProps> = ({ stats }) => {
  const averageValue = stats?.overview.averageOrderValue ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Giá Trị TB/Đơn</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(averageValue)}
          </p>
        </div>
        <div className="p-3 bg-purple-100 rounded-full">
          📊
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm text-purple-600">
        📈
        <span className="ml-1">Trung bình</span>
      </div>
    </div>
  );
};

