import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DailySales, DashboardStats } from '../types';

interface RevenueCardProps {
  dailySales: DailySales | null;
  yesterdaySales: DailySales | null;
  stats: DashboardStats | null;
}

export const RevenueCard: React.FC<RevenueCardProps> = ({ dailySales, yesterdaySales, stats }) => {
  const todayRevenue = stats?.overview.todayRevenue ?? dailySales?.totalRevenue ?? 0;

  let percentChange: number | null = null;
  let isPositive = false;

  if (yesterdaySales && yesterdaySales.totalRevenue > 0) {
    const diff = todayRevenue - yesterdaySales.totalRevenue;
    percentChange = Number(((diff / yesterdaySales.totalRevenue) * 100).toFixed(1));
    isPositive = diff >= 0;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(todayRevenue)}
          </p>
          {percentChange !== null && (
            <p className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(percentChange)}% so với hôm qua
            </p>
          )}
        </div>
        <div className="p-3 bg-green-100 rounded-full">
          💰
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm text-green-600">
        📈
        <span className="ml-1">Hôm nay</span>
      </div>
    </div>
  );
};

