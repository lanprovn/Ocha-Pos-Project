"use client";
import React from 'react';
import type { PeakHourData } from '@features/reporting/services/reporting.service';
import { formatPrice } from '@/utils/formatPrice';

interface PeakHoursChartProps {
  peakHours: PeakHourData[];
  isLoading: boolean;
}

export const PeakHoursChart: React.FC<PeakHoursChartProps> = ({
  peakHours,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
        </div>
      </div>
    );
  }

  if (peakHours.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh Thu Theo Giờ (Peak Hours)</h3>
        <div className="text-center text-gray-500">
          <p>Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...peakHours.map((h) => h.revenue), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Doanh Thu Theo Giờ (Peak Hours)
      </h3>
      <div className="space-y-3">
        {peakHours.slice(0, 10).map((hour, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-16 text-sm font-medium text-gray-700">
              {hour.hour.toString().padStart(2, '0')}:00
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-slate-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(hour.revenue / maxRevenue) * 100}%` }}
                  ></div>
                </div>
                <div className="w-24 text-sm font-semibold text-gray-900 text-right">
                  {formatPrice(hour.revenue)}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {hour.orderCount} đơn hàng
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

