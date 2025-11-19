import React from 'react';
import { EmptyState } from '@components/common/ui/EmptyState';
import { AlertCard } from './AlertCard';
import { formatCurrency, formatTime } from '../utils/stockUtils';
import type { StockAlert } from '@services/stock.service.ts';
import type { IngredientAlert, IngredientStock } from '@utils/ingredientManagement';

interface AlertsTabProps {
  alerts: StockAlert[];
  ingredientAlerts: IngredientAlert[];
  ingredients: IngredientStock[];
  getProductInfo: (id: string) => any;
  handleMarkAlertAsRead: (alertId: string) => void;
  handleMarkIngredientAlertAsRead: (alertId: string) => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
  alerts,
  ingredientAlerts,
  ingredients,
  getProductInfo,
  handleMarkAlertAsRead,
  handleMarkIngredientAlertAsRead,
}) => {
  // Provide default values to prevent undefined errors
  const safeAlerts = alerts || [];
  const safeIngredientAlerts = ingredientAlerts || [];
  const safeIngredients = ingredients || [];
  
  const productAlerts = safeAlerts.filter((alert) => alert && alert.productId);
  const ingredientAlertsFiltered = safeIngredientAlerts.filter((alert) => alert && alert.ingredientId);

  if (productAlerts.length === 0 && ingredientAlertsFiltered.length === 0) {
    return (
      <EmptyState
        icon="🔔"
        title="Không có cảnh báo nào"
        message="Tất cả sản phẩm và nguyên liệu đều đủ hàng!"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Product Alerts */}
      {productAlerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Cảnh báo sản phẩm</h3>
          {productAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              type="product"
              productInfo={alert.productId ? getProductInfo(alert.productId) : null}
              formatCurrency={formatCurrency}
              formatTime={formatTime}
              onMarkAsRead={() => handleMarkAlertAsRead(alert.id)}
            />
          ))}
        </div>
      )}

      {/* Ingredient Alerts */}
      {ingredientAlertsFiltered.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🥛 Cảnh báo nguyên liệu</h3>
          {ingredientAlertsFiltered.map((alert) => {
            const ingredient = safeIngredients.find((ing) => ing.id === alert.ingredientId);
            return (
              <AlertCard
                key={alert.id}
                alert={alert}
                type="ingredient"
                ingredient={ingredient}
                formatTime={formatTime}
                onMarkAsRead={() => handleMarkIngredientAlertAsRead(alert.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

