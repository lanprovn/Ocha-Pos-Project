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
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh Thu Theo Giờ</h3>
      <div className="space-y-3">
        {hourlyData.length > 0 ? (
          hourlyData.map((hour) => (
            <div key={hour.hour} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-16 flex-shrink-0 font-mono">
                {`${hour.hour.toString().padStart(2, '0')}:00`}
              </span>
              <div className="flex-1 mx-4 min-w-0 overflow-hidden">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-slate-700 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${totalRevenue > 0 
                        ? Math.min((hour.revenue / totalRevenue) * 100, 100)
                        : 0}%`,
                      maxWidth: '100%'
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 w-24 text-right flex-shrink-0">
                {formatCurrency(hour.revenue)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};

