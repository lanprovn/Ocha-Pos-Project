import React from 'react';
import type { StockAlert } from '@services/stock.service.ts';

interface StockAlertsCardProps {
  alerts: StockAlert[];
  lowStockCount: number;
  outOfStockCount: number;
}

export const StockAlertsCard: React.FC<StockAlertsCardProps> = ({ alerts, lowStockCount, outOfStockCount }) => {
  const unreadAlerts = alerts.filter((alert) => !alert.isRead).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 border-l-4 border-l-red-500">
      <div>
        <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Cảnh Báo Tồn Kho</p>
        <p className="text-3xl font-bold text-slate-900 mb-1">
          {unreadAlerts}
        </p>
        <p className="text-sm text-slate-600 mt-1 font-medium">
          {outOfStockCount} hết hàng • {lowStockCount} cần nhập
        </p>
      </div>
    </div>
  );
};

