import React from 'react';
import type { BestSellerData } from '@features/reporting/services/reporting.service';
import { formatPrice } from '@/utils/formatPrice';

interface BestSellersChartProps {
  bestSellers: BestSellerData[];
  isLoading: boolean;
}

export const BestSellersChart: React.FC<BestSellersChartProps> = ({
  bestSellers,
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

  if (bestSellers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Món Bán Chạy</h3>
        <div className="text-center text-gray-500">
          <p>Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  const maxPercentage = Math.max(...bestSellers.map((s) => s.percentage), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Món Bán Chạy (Best Sellers)
      </h3>
      <div className="space-y-4">
        {bestSellers.slice(0, 10).map((seller, index) => (
          <div key={seller.productId} className="flex items-center space-x-4">
            <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-sm font-semibold text-slate-700">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {seller.productName}
                  </div>
                  {seller.category && (
                    <div className="text-xs text-gray-500">{seller.category}</div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatPrice(seller.revenue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {seller.quantitySold} sản phẩm
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(seller.percentage / maxPercentage) * 100}%` }}
                  ></div>
                </div>
                <div className="w-16 text-xs font-medium text-gray-700 text-right">
                  {seller.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

