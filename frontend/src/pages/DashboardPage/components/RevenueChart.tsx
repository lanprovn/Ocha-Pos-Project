import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface RevenueChartProps {
  stats: DashboardStats | null;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ stats }) => {
  const hourlyData = stats?.hourlyRevenue ?? [];
  const totalRevenue = stats?.overview.todayRevenue ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh Thu Theo Giờ</h3>
      <div className="space-y-3">
        {hourlyData.map((hour) => (
          <div key={hour.hour} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 w-16 flex-shrink-0">
              {`${hour.hour.toString().padStart(2, '0')}:00`}
            </span>
            <div className="flex-1 mx-4 min-w-0 overflow-hidden">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${totalRevenue > 0 
                      ? Math.min((hour.revenue / totalRevenue) * 100, 100)
                      : 0}%`,
                    maxWidth: '100%'
                  }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900 w-20 text-right flex-shrink-0">
              {formatCurrency(hour.revenue)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

