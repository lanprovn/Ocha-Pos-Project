import React, { memo } from 'react';
import type { StockAlert } from '@services/stock.service.ts';
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
  if (alertType === 'out_of_stock') return '❌';
  if (alertType === 'low_stock') return '⚠️';
  return '📦';
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
    <div className={`rounded-lg p-4 border mb-4 ${bgColor}`}>
      <div className="flex items-start space-x-4">
        {type === 'product' && productInfo?.image && (
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
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
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🥛</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-xl">{getAlertIcon(alert.type)}</span>
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
                className={`px-4 py-2 text-white text-sm rounded-lg flex-shrink-0 ${
                  type === 'product' ? 'bg-blue-500' : 'bg-orange-500'
                }`}
                style={{
                  willChange: 'background-color',
                  transition: 'background-color 0.2s ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = type === 'product' ? 'rgb(37 99 235)' : 'rgb(234 88 12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                ✓ Đã đọc
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

AlertCard.displayName = 'AlertCard';

