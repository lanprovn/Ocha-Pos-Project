"use client";
import React from 'react';
import { formatCurrency, formatTime } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface RecentOrdersProps {
  orders: DashboardStats['recentOrders'] | undefined;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  const recentOrders = orders ? orders.slice(0, 10) : [];

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn Hàng Gần Đây</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <div key={order.id} className="bg-gray-50 rounded-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Đơn #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-600">
                        {formatTime(new Date(order.createdAt).getTime())} • {order.customerName || 'Khách hàng'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-600">
                      {order.itemCount} món
                  </p>
                </div>
              </div>
              
              {/* Product Details */}
              {order.products && order.products.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
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
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm text-gray-600">Chưa có đơn hàng nào hôm nay</p>
          </div>
        )}
      </div>
    </div>
  );
};

