"use client";
import React from 'react';
import type { StockAlert } from '@features/stock/services/stock.service';

interface StockAlertsCardProps {
  alerts: StockAlert[];
  lowStockCount: number;
  outOfStockCount: number;
}

export const StockAlertsCard: React.FC<StockAlertsCardProps> = ({ alerts, lowStockCount, outOfStockCount }) => {
  const unreadAlerts = alerts.filter((alert) => !alert.isRead).length;

  return (
    <div className="bg-gradient-to-br from-red-50 to-rose-100/50 rounded-lg border-l-4 border-red-500 p-5 hover:shadow-md transition-shadow">
      <p className="text-xs text-red-700 mb-3 font-medium uppercase tracking-wide">Cảnh Báo Tồn Kho</p>
      <p className="text-2xl font-bold text-red-900 mb-1">
        {unreadAlerts}
      </p>
      <p className="text-sm text-red-700 mt-1 font-medium">
        {outOfStockCount} hết hàng • {lowStockCount} cần nhập
      </p>
    </div>
  );
};

