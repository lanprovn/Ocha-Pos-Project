import React from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardHeader } from './components/DashboardHeader';
import { StatsCards } from './components/StatsCards';
import { RevenueChart } from './components/RevenueChart';
import { RevenueSummary } from './components/RevenueSummary';
import { TopProductsTable } from './components/TopProductsTable';
import { PaymentStats } from './components/PaymentStats';
import { RecentOrders } from './components/RecentOrders';
import { QuickActions } from './components/QuickActions';

const DashboardPage: React.FC = () => {
  const {
    dailySales,
    yesterdaySales,
    stats,
    isLoading,
    currentTime,
    isConnected,
    stockAlerts,
    lowStockCount,
    outOfStockCount,
    reloadData,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardHeader 
        currentTime={currentTime}
        isConnected={isConnected}
        onReset={reloadData}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards 
          dailySales={dailySales} 
          yesterdaySales={yesterdaySales}
          stats={stats}
          stockAlerts={stockAlerts} 
          lowStockCount={lowStockCount}
          outOfStockCount={outOfStockCount}
        />

        {/* Revenue Summary */}
        <RevenueSummary />

        {/* Charts and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueChart stats={stats} />
          <RecentOrders orders={stats?.recentOrders} />
        </div>

        {/* Top Products & Payment Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <TopProductsTable stats={stats} />
          <PaymentStats stats={stats} />
        </div>

        <QuickActions onRefresh={reloadData} />
      </div>
    </div>
  );
};

export default DashboardPage;

