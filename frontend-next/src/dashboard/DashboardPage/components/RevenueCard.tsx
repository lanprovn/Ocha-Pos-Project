"use client";
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
    <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-lg border-l-4 border-emerald-500 p-5 hover:shadow-md transition-shadow">
      <p className="text-xs text-emerald-700 mb-3 font-medium uppercase tracking-wide">Tổng Doanh Thu</p>
      <p className="text-2xl font-bold text-emerald-900 mb-2">
        {formatCurrency(todayRevenue)}
      </p>
      {percentChange !== null && (
        <p className={`text-xs mt-2 font-medium ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(percentChange)}% so với hôm qua
        </p>
      )}
    </div>
  );
};

