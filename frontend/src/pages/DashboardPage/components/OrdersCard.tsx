import React from 'react';
import type { DashboardStats } from '../types';

interface OrdersCardProps {
  stats: DashboardStats | null;
}

export const OrdersCard: React.FC<OrdersCardProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6 border-l-4 border-l-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">Tổng Đơn Hàng</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {stats?.overview.todayOrders ?? 0}
          </p>
        </div>
        <div className="p-3 bg-slate-100 rounded-md ml-4">
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

