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
      <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6 border-l-4 border-l-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Tổng Sản Phẩm</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalProducts}</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-md ml-4">
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6 border-l-4 border-l-green-600">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Đủ Hàng</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{inStock}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-md ml-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6 border-l-4 border-l-amber-600">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Sắp Hết</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{lowStock}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-md ml-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6 border-l-4 border-l-red-600">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Hết Hàng</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{outOfStock}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-md ml-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

