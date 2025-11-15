import React from 'react';
import { RevenueCard } from './RevenueCard';
import { OrdersCard } from './OrdersCard';
import { AverageOrderCard } from './AverageOrderCard';
import { TopProductCard } from './TopProductCard';
import { StockAlertsCard } from './StockAlertsCard';
import type { DailySales, DashboardStats } from '../types';
import type { StockAlert } from '@services/stock.service.ts';

interface StatsCardsProps {
  dailySales: DailySales | null;
  yesterdaySales: DailySales | null;
  stats: DashboardStats | null;
  stockAlerts: StockAlert[];
  lowStockCount: number;
  outOfStockCount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  dailySales,
  yesterdaySales,
  stats,
  stockAlerts,
  lowStockCount,
  outOfStockCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <RevenueCard dailySales={dailySales} yesterdaySales={yesterdaySales} stats={stats} />
      <OrdersCard stats={stats} />
      <AverageOrderCard stats={stats} />
      <TopProductCard stats={stats} />
      <StockAlertsCard
        alerts={stockAlerts}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
      />
    </div>
  );
};

