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
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6 border-l-4 border-l-red-600">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">Cảnh Báo Tồn Kho</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {unreadAlerts}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {outOfStockCount} hết hàng • {lowStockCount} cần nhập
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-md ml-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

