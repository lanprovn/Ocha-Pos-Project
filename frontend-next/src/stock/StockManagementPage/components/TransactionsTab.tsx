"use client";
import React from 'react';
import { SearchBar } from '@components/ui/SearchBar';
import { EmptyState } from '@components/ui/EmptyState';
import { TransactionCard } from './TransactionCard';
import { formatCurrency, formatTime } from '../utils/stockUtils';
import type { StockTransaction } from '@features/stock/services/stock.service';

interface TransactionsTabProps {
  filteredTransactions: StockTransaction[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  getProductInfo: (id: string) => any;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  filteredTransactions,
  searchQuery,
  setSearchQuery,
  getProductInfo,
}) => {
  return (
    <div>
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm kiếm giao dịch theo tên sản phẩm hoặc ID..."
        />
      </div>

      {filteredTransactions.length === 0 && (
        <EmptyState
          icon="📋"
          title={searchQuery ? 'Không tìm thấy giao dịch' : 'Chưa có giao dịch nào'}
          message={
            searchQuery
              ? 'Thử thay đổi từ khóa tìm kiếm'
              : 'Các giao dịch sẽ xuất hiện ở đây khi có hoạt động tồn kho'
          }
        />
      )}

      {filteredTransactions.length > 0 && (
        <div className="space-y-4">
          {filteredTransactions.slice(0, 50).map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              productInfo={transaction.productId ? getProductInfo(transaction.productId) : null}
              formatCurrency={formatCurrency}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </div>
  );
};

