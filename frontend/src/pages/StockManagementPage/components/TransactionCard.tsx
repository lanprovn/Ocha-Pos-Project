import React, { memo } from 'react';
import type { StockTransaction } from '@services/stock.service.ts';
import type { Product } from '@/types/product';

interface TransactionCardProps {
  transaction: StockTransaction;
  productInfo: Product | null;
  formatCurrency: (amount: number) => string;
  formatTime: (timestamp: number) => string;
}

const transactionTypeLabels: Record<StockTransaction['type'], string> = {
  sale: 'Bán hàng',
  purchase: 'Nhập hàng',
  adjustment: 'Điều chỉnh',
  return: 'Trả hàng',
};

const transactionTypeColors: Record<StockTransaction['type'], string> = {
  sale: 'bg-red-100 text-red-800',
  purchase: 'bg-green-100 text-green-800',
  adjustment: 'bg-blue-100 text-blue-800',
  return: 'bg-yellow-100 text-yellow-800',
};

export const TransactionCard: React.FC<TransactionCardProps> = memo(({
  transaction,
  productInfo,
  formatCurrency,
  formatTime,
}) => {
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-4 hover:shadow-md transition-all">
      <div className="flex items-start space-x-4">
        {productInfo?.image && (
          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
            <img
              src={productInfo.image}
              alt={productInfo.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/src/assets/img/gallery/default-food.png';
              }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg">
                {productInfo?.name || transaction.productId || 'Unknown Product'}
              </h4>
              {productInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  {productInfo.restaurant} • {formatCurrency(productInfo.price)}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                    transactionTypeColors[transaction.type]
                  }`}
                >
                  {transactionTypeLabels[transaction.type]}
                </span>
                <span className="text-sm text-gray-600">{formatTime(transaction.timestamp)}</span>
              </div>
              {transaction.reason && (
                <p className="text-sm text-gray-600 mt-2 italic">"{transaction.reason}"</p>
              )}
            </div>

            <div className="text-right ml-4">
              <p
                className={`text-2xl font-bold ${
                  transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.quantity > 0 ? '+' : ''}
                {transaction.quantity}
              </p>
              <p className="text-sm text-gray-500">{productInfo ? 'sản phẩm' : 'đơn vị'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TransactionCard.displayName = 'TransactionCard';

