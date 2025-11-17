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
    <div className="bg-white rounded-md shadow-sm border border-gray-300 mb-8">
      <div className="border-b border-gray-300">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          <button
            onClick={() => onTabChange('stocks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'stocks'
                ? 'border-slate-700 text-slate-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tồn Kho ({stocksCount})
          </button>
          <button
            onClick={() => onTabChange('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'transactions'
                ? 'border-slate-700 text-slate-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Giao Dịch ({transactionsCount})
          </button>
          <button
            onClick={() => onTabChange('alerts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'alerts'
                ? 'border-slate-700 text-slate-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Cảnh Báo ({alertsCount})
          </button>
          <button
            onClick={() => onTabChange('ingredients')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'ingredients'
                ? 'border-slate-700 text-slate-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Nguyên Liệu ({ingredientsCount})
          </button>
        </nav>
      </div>
    </div>
  );
};

