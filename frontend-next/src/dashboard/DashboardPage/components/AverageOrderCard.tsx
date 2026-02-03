"use client";
import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface AverageOrderCardProps {
  stats: DashboardStats | null;
}

export const AverageOrderCard: React.FC<AverageOrderCardProps> = ({ stats }) => {
  const averageValue = stats?.overview.averageOrderValue ?? 0;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100/50 rounded-lg border-l-4 border-indigo-500 p-5 hover:shadow-md transition-shadow">
      <p className="text-xs text-indigo-700 mb-3 font-medium uppercase tracking-wide">Giá Trị TB/Đơn</p>
      <p className="text-2xl font-bold text-indigo-900">
        {formatCurrency(averageValue)}
      </p>
    </div>
  );
};

