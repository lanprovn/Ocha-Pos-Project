import React, { memo } from 'react';
import type { StockProduct } from '@services/stock.service.ts';
import type { Product } from '../../../types/product';

interface StockCardProps {
  stock: StockProduct;
  productInfo: Product | null;
  status: string;
  statusColor: string;
  statusIcon: string;
  formatCurrency: (amount: number) => string;
  onAddStock: () => void;
  onAdjustStock: () => void;
  onEditProduct: () => void;
}

export const StockCard: React.FC<StockCardProps> = memo(({
  stock,
  productInfo,
  status,
  statusColor,
  statusIcon,
  formatCurrency,
  onAddStock,
  onAdjustStock,
  onEditProduct,
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
      style={{
        willChange: 'box-shadow',
        transition: 'box-shadow 0.3s ease-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {productInfo?.image && (
        <div className="h-32 overflow-hidden">
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

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
              {productInfo?.name ||
                `Sản phẩm ${stock.productId ? stock.productId.slice(0, 8) : 'Unknown'}...`}
            </h3>
            {productInfo ? (
              <p className="text-sm text-gray-600 mt-1">
                {productInfo.restaurant} • {formatCurrency(productInfo.price)}
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">ID: {stock.productId || 'Unknown'}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <span className={`text-lg ${statusColor}`}>{statusIcon}</span>
            <button
              onClick={onEditProduct}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tồn kho:</span>
            <span
              className={`font-semibold text-lg ${
                status === 'out_of_stock'
                  ? 'text-red-600'
                  : status === 'low_stock'
                    ? 'text-yellow-600'
                    : 'text-green-600'
              }`}
            >
              {stock.currentStock} {stock.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Tối thiểu:</span>
            <span className="text-sm">
              {stock.minStock} {stock.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Tối đa:</span>
            <span className="text-sm">
              {stock.maxStock} {stock.unit}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onAddStock}
            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded"
            style={{
              willChange: 'background-color',
              transition: 'background-color 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(37 99 235)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            ➕ Nhập
          </button>
          <button
            onClick={onAdjustStock}
            className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded"
            style={{
              willChange: 'background-color',
              transition: 'background-color 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(75 85 99)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            ✏️ Điều Chỉnh
          </button>
        </div>
      </div>
    </div>
  );
});

StockCard.displayName = 'StockCard';

