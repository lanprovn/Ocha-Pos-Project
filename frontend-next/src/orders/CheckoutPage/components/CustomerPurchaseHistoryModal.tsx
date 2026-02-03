"use client";
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import customerService from '@features/customers/services/customer.service';

interface CustomerPurchaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export const CustomerPurchaseHistoryModal: React.FC<CustomerPurchaseHistoryModalProps> = ({
  isOpen,
  onClose,
  customerId,
}) => {
  const [history, setHistory] = useState<{
    orders: Array<{
      id: string;
      orderNumber: string;
      status: string;
      totalAmount: number;
      createdAt: string;
      items: Array<{
        id: string;
        product: {
          id: string;
          name: string;
          image: string | null;
          price: number;
        };
        quantity: number;
        price: number;
        subtotal: number;
      }>;
    }>;
    frequentProducts: Array<{
      product: {
        id: string;
        name: string;
        image: string | null;
        price: number;
      };
      count: number;
      totalQuantity: number;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      setIsLoading(true);
      customerService
        .getPurchaseHistory(customerId)
        .then((data) => {
          setHistory(data);
        })
        .catch((error) => {
          console.error('Error loading purchase history:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const statusLabels: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    PREPARING: 'Đang chuẩn bị',
    READY: 'Sẵn sàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    READY: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[80%] bg-white rounded-lg shadow-xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Lịch sử mua hàng</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Đang tải...</p>
            </div>
          ) : history ? (
            <div className="space-y-6">
              {/* Frequent Products */}
              {history.frequentProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Sản phẩm thường mua</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {history.frequentProducts.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                      >
                        {item.product.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            Đã mua {item.count} lần • {item.totalQuantity} sản phẩm
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Đơn hàng ({history.orders.length})
                </h3>
                <div className="space-y-3">
                  {history.orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Chưa có đơn hàng nào</p>
                  ) : (
                    history.orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-800">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                statusColors[order.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {statusLabels[order.status] || order.status}
                            </span>
                            <p className="text-sm font-semibold text-gray-800 mt-1">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                                minimumFractionDigits: 0,
                              }).format(order.totalAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {item.product.name} x{item.quantity}
                              </span>
                              <span className="text-gray-600">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                  minimumFractionDigits: 0,
                                }).format(item.subtotal)}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-xs text-gray-500 mt-1">
                              +{order.items.length - 3} sản phẩm khác
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có dữ liệu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

