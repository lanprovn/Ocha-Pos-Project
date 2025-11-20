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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div>
        <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Tổng Doanh Thu</p>
        <p className="text-3xl font-bold text-slate-900 mb-2">
          {formatCurrency(todayRevenue)}
        </p>
        {percentChange !== null && (
          <p className={`text-xs mt-2 flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            <svg className={`w-3 h-3 mr-1 ${isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(percentChange)}% so với hôm qua
          </p>
        )}
      </div>
    </div>
  );
};

