import React from 'react';
import type { ReportSummary } from '@features/reporting/services/reporting.service';
import { formatPrice } from '@/utils/formatPrice';

interface SummaryCardsProps {
  summary: ReportSummary;
  isLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng Đơn Hàng</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {summary.totalOrders.toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatPrice(summary.totalRevenue)}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Giảm Giá</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatPrice(summary.totalDiscount)}
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎁</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Thực Thu</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">
              {formatPrice(summary.netRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              TB: {formatPrice(summary.averageOrderValue)}/đơn
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">💵</span>
          </div>
        </div>
      </div>
    </div>
  );
};

