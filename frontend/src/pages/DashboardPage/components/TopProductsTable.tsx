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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Sản Phẩm Bán Chạy</h3>
      <div className="space-y-3">
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-600' :
                  'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-600">
                    {product.quantity} đơn • {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(product.revenue)}
                </div>
                <div className="text-xs text-gray-500">
                  {totalRevenue > 0
                    ? `${((product.revenue / totalRevenue) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};

