import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface TopProductsTableProps {
  stats: DashboardStats | null;
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ stats }) => {
  const topProducts = stats?.topProducts.slice(0, 5) || [];
  const totalRevenue = stats?.overview.todayRevenue ?? 0;

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Sản Phẩm Bán Chạy</h3>
      <div className="space-y-2">
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm ${
                  index === 0 ? 'bg-slate-700 text-white' :
                  index === 1 ? 'bg-slate-600 text-white' :
                  index === 2 ? 'bg-slate-500 text-white' :
                  'bg-gray-300 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-600">
                    {product.quantity} đơn • {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(product.revenue)}
                </div>
                <div className="text-xs text-gray-600">
                  {totalRevenue > 0
                    ? `${((product.revenue / totalRevenue) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm text-gray-600">Chưa có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};

