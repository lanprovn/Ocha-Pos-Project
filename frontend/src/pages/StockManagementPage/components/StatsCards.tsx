import React from 'react';

interface StatsCardsProps {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalProducts,
  inStock,
  lowStock,
  outOfStock
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng Sản Phẩm</p>
            <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">📦</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Đủ Hàng</p>
            <p className="text-3xl font-bold text-gray-900">{inStock}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">✅</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Sắp Hết</p>
            <p className="text-3xl font-bold text-gray-900">{lowStock}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">⚠️</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Hết Hàng</p>
            <p className="text-3xl font-bold text-gray-900">{outOfStock}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">❌</div>
        </div>
      </div>
    </div>
  );
};

