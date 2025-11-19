import React from 'react';
import { useDashboardData } from '../../DashboardPage/hooks/useDashboardData';
import { DashboardHeader } from '../../DashboardPage/components/DashboardHeader';
import { StatsCards } from '../../DashboardPage/components/StatsCards';
import { RevenueChart } from '../../DashboardPage/components/RevenueChart';
import { TopProductsTable } from '../../DashboardPage/components/TopProductsTable';
import { PaymentStats } from '../../DashboardPage/components/PaymentStats';
import { RecentOrders } from '../../DashboardPage/components/RecentOrders';

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
      <div className="min-h-[400px] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Show error state if no data loaded
  if (!stats && !dailySales && !isLoading) {
    return (
      <div className="min-h-[400px] bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không thể tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-4">
            Vui lòng kiểm tra kết nối API hoặc thử lại sau.
          </p>
          <button
            onClick={reloadData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
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

