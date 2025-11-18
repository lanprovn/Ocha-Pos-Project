import React, { useState, useEffect, useCallback } from 'react';
import stockService from '@services/stock.service.ts';
import type { StockAlert } from '@services/stock.service.ts';
import { subscribeToDashboard } from '@services/socket.service';
import toast from 'react-hot-toast';

const StockAlertsPanel: React.FC = () => {
  const [productAlerts, setProductAlerts] = useState<StockAlert[]>([]);
  const [ingredientAlerts, setIngredientAlerts] = useState<StockAlert[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const alerts = await stockService.getAlerts({ isRead: false });
      const productUnread = alerts.filter((alert: StockAlert) => alert.productId);
      const ingredientUnread = alerts.filter((alert: StockAlert) => alert.ingredientId);

      setProductAlerts(productUnread);
      setIngredientAlerts(ingredientUnread);
      setIsVisible(productUnread.length > 0 || ingredientUnread.length > 0);
    } catch (error) {
      console.error('Error loading stock alerts:', error);
      setProductAlerts([]);
      setIngredientAlerts([]);
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();

    // Subscribe to Socket.io for real-time stock alerts
    const cleanup = subscribeToDashboard(
      undefined, // dashboard update
      (alert) => {
        // Stock alert received - reload alerts and show notification
        console.log('⚠️ Stock alert received:', alert);
        loadAlerts();
        
        // Show toast notification
        toast.error(alert.message || 'Cảnh báo tồn kho', {
          duration: 5000,
          icon: '⚠️',
        });
      },
      undefined // stock updated
    );

    // Fallback: Listen for window events (if socket.io not available)
    const handleStockUpdate = () => {
      loadAlerts();
    };

    window.addEventListener('stockAlert', handleStockUpdate);
    window.addEventListener('ingredientAlert', handleStockUpdate);
    
    return () => {
      cleanup();
      window.removeEventListener('stockAlert', handleStockUpdate);
      window.removeEventListener('ingredientAlert', handleStockUpdate);
    };
  }, [loadAlerts]);

  const handleDismissProductAlert = async (alertId: string) => {
    try {
      await stockService.markAlertAsRead(alertId);
    } catch (error) {
      console.error('Error marking product alert as read:', error);
    }
    setProductAlerts((prev) => {
      const updated = prev.filter((alert) => alert.id !== alertId);
      if (updated.length === 0 && ingredientAlerts.length === 0) {
        setIsVisible(false);
      }
      return updated;
    });
  };

  const handleDismissIngredientAlert = async (alertId: string) => {
    try {
      await stockService.markAlertAsRead(alertId);
    } catch (error) {
      console.error('Error marking ingredient alert as read:', error);
    }
    setIngredientAlerts((prev) => {
      const updated = prev.filter((alert) => alert.id !== alertId);
      if (updated.length === 0 && productAlerts.length === 0) {
        setIsVisible(false);
      }
      return updated;
    });
  };

  const handleDismissAll = async () => {
    try {
      const promises = [...productAlerts, ...ingredientAlerts].map((alert) =>
        stockService.markAlertAsRead(alert.id)
      );
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error dismissing all alerts:', error);
    }
    setProductAlerts([]);
    setIngredientAlerts([]);
    setIsVisible(false);
  };

  const totalAlerts = productAlerts.length + ingredientAlerts.length;

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-lg">⚠️</span>
            <h3 className="text-sm font-semibold text-red-800">
              Cảnh Báo Tồn Kho ({totalAlerts})
            </h3>
          </div>
          <button
            onClick={handleDismissAll}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            ✕ Tất cả
          </button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {/* Product Alerts */}
          {productAlerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="bg-white rounded p-3 border border-red-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm">📦</span>
                    <p className="text-sm text-red-700">{alert.message}</p>
                  </div>
                  <p className="text-xs text-red-500">
                    {new Date(alert.timestamp).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
                <button
                  onClick={() => handleDismissProductAlert(alert.id)}
                  className="text-red-400 hover:text-red-600 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          
          {/* Ingredient Alerts */}
          {ingredientAlerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="bg-white rounded p-3 border border-orange-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm">🥛</span>
                    <p className="text-sm text-orange-700">{alert.message}</p>
                  </div>
                  <p className="text-xs text-orange-500">
                    {new Date(alert.timestamp).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
                <button
                  onClick={() => handleDismissIngredientAlert(alert.id)}
                  className="text-orange-400 hover:text-orange-600 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {totalAlerts > 6 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => window.location.href = '/stock-management'}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Xem tất cả ({totalAlerts} cảnh báo)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAlertsPanel;
