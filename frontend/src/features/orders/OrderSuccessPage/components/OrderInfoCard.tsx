import React from 'react';
import type { OrderDetails, PaymentMethod } from '../types';

interface OrderInfoCardProps {
  orderDetails: OrderDetails;
  paymentMethod: PaymentMethod;
}

export const OrderInfoCard: React.FC<OrderInfoCardProps> = ({
  orderDetails,
  paymentMethod
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'Tiền mặt';
      case 'card':
        return 'Thẻ ngân hàng';
      case 'qr':
        return 'Quét mã QR';
      default:
        return 'Chưa xác định';
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-4 mb-3 w-full">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Thông tin đơn hàng</h2>
      
      <div className="space-y-2">
        {orderDetails.orderNumber && (
          <div className="flex justify-between items-center py-1 border-b border-gray-200">
            <span className="text-sm text-gray-600 font-medium">Mã đơn hàng:</span>
            <span className="text-sm text-gray-800 font-bold">{orderDetails.orderNumber}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center py-1 border-b border-gray-200">
          <span className="text-sm text-gray-600 font-medium">Khách hàng:</span>
          <span className="text-sm text-gray-800">{orderDetails.customerName}</span>
        </div>
        
        <div className="flex justify-between items-center py-1 border-b border-gray-200">
          <span className="text-sm text-gray-600 font-medium">Thời gian:</span>
          <span className="text-sm text-gray-800">{formatDate(orderDetails.timestamp)}</span>
        </div>
        
        <div className="flex justify-between items-center py-1 border-b border-gray-200">
          <span className="text-sm text-gray-600 font-medium">Số lượng món:</span>
          <span className="text-sm text-gray-800">{orderDetails.items} món</span>
        </div>
        
        <div className="flex justify-between items-center py-1 border-b border-gray-200">
          <span className="text-sm text-gray-600 font-medium">Phương thức thanh toán:</span>
          <span className="text-sm text-gray-800">{getPaymentMethodLabel(paymentMethod)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 mt-2">
          <span className="text-base font-bold text-gray-900">Tổng cộng:</span>
          <span className="text-lg font-bold text-slate-700">{formatCurrency(orderDetails.total)}</span>
        </div>
      </div>

      {/* Product List */}
      {orderDetails.products && orderDetails.products.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Chi tiết đơn hàng:</h3>
          <div className="space-y-2">
            {orderDetails.products.map((product, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                    {product.size && (
                      <p className="text-xs text-gray-600 mt-0.5">Size: {product.size}</p>
                    )}
                    {product.toppings && product.toppings.length > 0 && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        Topping: {product.toppings.join(', ')}
                      </p>
                    )}
                    {product.note && (
                      <p className="text-xs text-gray-500 italic mt-0.5">Ghi chú: {product.note}</p>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-xs text-gray-600">x{product.quantity}</p>
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

