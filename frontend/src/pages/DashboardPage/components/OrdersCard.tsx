import React from 'react';
import type { DashboardStats } from '../types';

interface OrdersCardProps {
  stats: DashboardStats | null;
}

export const OrdersCard: React.FC<OrdersCardProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div>
        <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Tổng Đơn Hàng</p>
        <p className="text-3xl font-bold text-slate-900 mb-1">
          {stats?.overview.todayOrders ?? 0}
        </p>
      </div>
    </div>
  );
};

