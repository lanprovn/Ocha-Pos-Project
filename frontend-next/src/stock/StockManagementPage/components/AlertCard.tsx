"use client";
import React, { memo } from 'react';
import type { StockAlert } from '@features/stock/services/stock.service';
import type { IngredientAlert, IngredientStock } from '@utils/ingredientManagement';
import type { Product } from '@/types/product';

interface AlertCardProps {
  alert: StockAlert | IngredientAlert;
  type: 'product' | 'ingredient';
  productInfo?: Product | null;
  ingredient?: IngredientStock | null;
  formatCurrency?: (amount: number) => string;
  formatTime: (timestamp: number) => string;
  onMarkAsRead: () => void;
}

const getAlertIcon = (alertType: string) => {
  if (alertType === 'out_of_stock') {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  if (alertType === 'low_stock') {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
};

export const AlertCard: React.FC<AlertCardProps> = memo(({
  alert,
  type,
  productInfo,
  ingredient,
  formatCurrency,
  formatTime,
  onMarkAsRead,
}) => {
  const isRead = alert.isRead;
  const bgColor = type === 'product' 
    ? (isRead ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200')
    : (isRead ? 'bg-gray-50 border-gray-200' : 'bg-orange-50 border-orange-200');
  const textColor = type === 'product'
    ? (isRead ? 'text-gray-700' : 'text-red-700')
    : (isRead ? 'text-gray-700' : 'text-orange-700');
  const bgContentColor = type === 'product'
    ? (isRead ? 'bg-gray-100' : 'bg-red-100')
    : (isRead ? 'bg-gray-100' : 'bg-orange-100');
  return (
    <div className={`rounded-md p-4 border border-gray-300 mb-4 ${bgColor}`}>
      <div className="flex items-start space-x-4">
        {type === 'product' && productInfo?.image && (
          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
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
        {type === 'ingredient' && (
          <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={textColor}>{getAlertIcon(alert.type)}</div>
                <div>
                  <h4 className={`font-semibold text-lg ${textColor}`}>
                    {type === 'product'
                      ? productInfo?.name || (alert as StockAlert).productId || 'Unknown Product'
                      : ingredient?.name || (alert as IngredientAlert).ingredientId || 'Unknown Ingredient'}
                  </h4>
                  {type === 'product' && productInfo && formatCurrency && (
                    <p className="text-sm text-gray-600">
                      {productInfo.restaurant} • {formatCurrency(productInfo.price)}
                    </p>
                  )}
                  {type === 'ingredient' && ingredient && (
                    <p className="text-sm text-gray-600">Đơn vị: {ingredient.unit}</p>
                  )}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${bgContentColor}`}>
                <p className={`font-medium ${textColor}`}>{alert.message}</p>
                <p className="text-sm text-gray-500 mt-1">{formatTime(alert.timestamp)}</p>
              </div>
            </div>

            {!isRead && (
              <button
                onClick={onMarkAsRead}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm rounded-md flex-shrink-0 transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Đã đọc</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

AlertCard.displayName = 'AlertCard';

