import React from 'react';
import { useDashboardData } from '@pages/DashboardPage/hooks/useDashboardData';
import { DashboardHeader } from '@pages/DashboardPage/components/DashboardHeader';
import { StatsCards } from '@pages/DashboardPage/components/StatsCards';
import { RevenueChart } from '@pages/DashboardPage/components/RevenueChart';
import { TopProductsTable } from '@pages/DashboardPage/components/TopProductsTable';
import { PaymentStats } from '@pages/DashboardPage/components/PaymentStats';
import { RecentOrders } from '@pages/DashboardPage/components/RecentOrders';

const DashboardTab: React.FC = () => {
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
      <div className="min-h-[400px] bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Show error state if no data loaded
  if (!stats && !dailySales && !isLoading) {
    return (
      <div className="min-h-[400px] bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
            Không thể tải dữ liệu
          </h3>
          <p className="text-slate-600 mb-4 font-medium">
            Vui lòng kiểm tra kết nối API hoặc thử lại sau.
          </p>
          <button
            onClick={reloadData}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm hover:shadow"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
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

        {/* Charts and Tables Grid */}
        {stats && (
          <>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart stats={stats} />
              <TopProductsTable stats={stats} />
            </div>

            {/* Payment Stats and Recent Orders */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentStats stats={stats} />
              <RecentOrders orders={stats?.recentOrders} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;

