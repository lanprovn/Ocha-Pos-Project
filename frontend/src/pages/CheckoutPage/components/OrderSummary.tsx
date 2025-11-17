import React from 'react';
import { formatPrice } from '../../../utils/formatPrice';
import type { CartItem } from '../../../types/cart';

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, totalPrice }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Đơn hàng</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-6">🛒</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-3">
            Giỏ hàng trống
          </h3>
          <p className="text-gray-500">
            Vui lòng thêm sản phẩm vào giỏ hàng
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Đơn hàng</h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <span className="text-lg font-semibold text-orange-500">
                {formatPrice(item.totalPrice)}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Số lượng: {item.quantity}
            </div>
            {item.selectedSize && (
              <div className="text-xs text-gray-600 mb-1">
                Size: {item.selectedSize.name}
                {item.selectedSize.extraPrice > 0 && ` (+${formatPrice(item.selectedSize.extraPrice)})`}
              </div>
            )}
            {item.selectedToppings.length > 0 && (
              <div className="text-xs text-gray-600 mb-1">
                Topping: {item.selectedToppings.map(t => 
                  `${t.name}${t.extraPrice > 0 ? ` (+${formatPrice(t.extraPrice)})` : ''}`
                ).join(', ')}
              </div>
            )}
            {item.note && (
              <div className="text-xs text-gray-600">
                Ghi chú: {item.note}
              </div>
            )}
          </div>
        ))}
        
        <div className="border-t border-gray-200 pt-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-800">Tạm tính:</span>
            <span className="font-semibold text-gray-800">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Phí dịch vụ:</span>
            <span className="text-gray-600">0₫</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">VAT (10%):</span>
            <span className="text-gray-600">{formatPrice(totalPrice * 0.1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
            <span className="text-xl font-bold text-orange-500">
              {formatPrice(totalPrice * 1.1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

