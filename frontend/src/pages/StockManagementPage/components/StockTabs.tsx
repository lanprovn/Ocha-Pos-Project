import React from 'react';
import type { StockTab } from '../types';

interface StockTabsProps {
  activeTab: StockTab;
  onTabChange: (tab: StockTab) => void;
  stocksCount: number;
  transactionsCount: number;
  alertsCount: number;
  ingredientsCount: number;
}

export const StockTabs: React.FC<StockTabsProps> = ({
  activeTab,
  onTabChange,
  stocksCount,
  transactionsCount,
  alertsCount,
  ingredientsCount
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          <button
            onClick={() => onTabChange('stocks')}
            className={`py-4 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === 'stocks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Tồn Kho ({stocksCount})
          </button>
          <button
            onClick={() => onTabChange('transactions')}
            className={`py-4 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === 'transactions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Giao Dịch ({transactionsCount})
          </button>
          <button
            onClick={() => onTabChange('alerts')}
            className={`py-4 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Cảnh Báo ({alertsCount})
          </button>
          <button
            onClick={() => onTabChange('ingredients')}
            className={`py-4 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === 'ingredients'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Nguyên Liệu ({ingredientsCount})
          </button>
        </nav>
      </div>
    </div>
  );
};

