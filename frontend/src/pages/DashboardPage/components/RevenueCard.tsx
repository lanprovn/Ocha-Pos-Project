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
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6 border-l-4 border-l-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(todayRevenue)}
          </p>
          {percentChange !== null && (
            <p className={`text-xs mt-2 flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <svg className={`w-3 h-3 mr-1 ${isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(percentChange)}% so với hôm qua
            </p>
          )}
        </div>
        <div className="p-3 bg-slate-100 rounded-md ml-4">
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

