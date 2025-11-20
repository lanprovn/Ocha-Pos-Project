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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Tổng Sản Phẩm</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">{totalProducts}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Đủ Hàng</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">{inStock}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Sắp Hết</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">{lowStock}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Hết Hàng</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">{outOfStock}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

