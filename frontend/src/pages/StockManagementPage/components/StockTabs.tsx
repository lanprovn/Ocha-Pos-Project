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
    <div className="bg-white rounded-xl shadow-lg mb-8">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          <button
            onClick={() => onTabChange('stocks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'stocks'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📦 Tồn Kho ({stocksCount})
          </button>
          <button
            onClick={() => onTabChange('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Giao Dịch ({transactionsCount})
          </button>
          <button
            onClick={() => onTabChange('alerts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🔔 Cảnh Báo ({alertsCount})
          </button>
          <button
            onClick={() => onTabChange('ingredients')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'ingredients'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🥛 Nguyên Liệu ({ingredientsCount})
          </button>
        </nav>
      </div>
    </div>
  );
};

