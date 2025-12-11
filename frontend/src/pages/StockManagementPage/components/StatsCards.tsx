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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border-l-4 border-slate-500 p-5 hover:shadow-md transition-shadow">
        <p className="text-xs text-slate-700 mb-3 font-medium uppercase tracking-wide">Tổng Sản Phẩm</p>
        <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-lg border-l-4 border-emerald-500 p-5 hover:shadow-md transition-shadow">
        <p className="text-xs text-emerald-700 mb-3 font-medium uppercase tracking-wide">Đủ Hàng</p>
        <p className="text-2xl font-bold text-emerald-900">{inStock}</p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-lg border-l-4 border-amber-500 p-5 hover:shadow-md transition-shadow">
        <p className="text-xs text-amber-700 mb-3 font-medium uppercase tracking-wide">Sắp Hết</p>
        <p className="text-2xl font-bold text-amber-900">{lowStock}</p>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-rose-100/50 rounded-lg border-l-4 border-red-500 p-5 hover:shadow-md transition-shadow">
        <p className="text-xs text-red-700 mb-3 font-medium uppercase tracking-wide">Hết Hàng</p>
        <p className="text-2xl font-bold text-red-900">{outOfStock}</p>
      </div>
    </div>
  );
};

