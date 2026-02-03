"use client";
import React from 'react';
import type { DashboardStats } from '../types';

interface OrdersCardProps {
  stats: DashboardStats | null;
}

export const OrdersCard: React.FC<OrdersCardProps> = ({ stats }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
      <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng Đơn Hàng</p>
      <p className="text-2xl font-bold text-blue-900">
        {stats?.overview.todayOrders ?? 0}
      </p>
    </div>
  );
};

