import React from 'react';
import type { DashboardStats } from '../types';

interface OrdersCardProps {
  stats: DashboardStats | null;
}

export const OrdersCard: React.FC<OrdersCardProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Tổng Đơn Hàng</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.overview.todayOrders ?? 0}
          </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          🛒
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm text-blue-600">
        ⏰
        <span className="ml-1">Đã xử lý</span>
      </div>
    </div>
  );
};

