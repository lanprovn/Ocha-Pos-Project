import React from 'react';
import { formatCurrency, formatTime } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface RecentOrdersProps {
  orders: DashboardStats['recentOrders'] | undefined;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  const recentOrders = orders ? orders.slice(0, 10) : [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn Hàng Gần Đây</h3>
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <div key={order.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Đơn #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatTime(new Date(order.createdAt).getTime())} • {order.customerName || 'Khách hàng'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                      {order.itemCount} món
                  </p>
                </div>
              </div>
              
              {/* Product Details */}
              {order.products && order.products.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="space-y-2">
                    {order.products.map((product, index) => (
                      <div key={index} className="flex justify-between items-start text-xs">
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">
                            {product.quantity}x {product.name}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-medium text-gray-700">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500">Chưa có đơn hàng nào hôm nay</p>
          </div>
        )}
      </div>
    </div>
  );
};

