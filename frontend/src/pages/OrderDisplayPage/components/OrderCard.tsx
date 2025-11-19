import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrderTracking } from '../../../types/display';
import { formatPrice } from '../../../utils/formatPrice';
import { formatOrderTime, getStatusConfig, getPaymentMethodText } from '../utils/orderDisplayUtils';
import { orderService } from '@services/order.service';
import PrintReceiptButton from './PrintReceiptButton';
import toast from 'react-hot-toast';

interface OrderCardProps {
  order: OrderTracking;
  currentTime: Date;
  onStatusUpdate?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, currentTime, onStatusUpdate }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const statusConfig = getStatusConfig(order.status);
  const isPaidOrAfter = ['paid', 'preparing', 'completed'].includes(order.status);
  
  const handleStatusUpdate = async (newStatus: string) => {
    if (!order.id || isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Sử dụng order.id (UUID) thay vì order.orderId (orderNumber)
      await orderService.updateStatus(order.id, { status: newStatus as any });
      toast.success(`Đã cập nhật trạng thái đơn hàng`);
      onStatusUpdate?.();
    } catch (error: any) {
      // Hiển thị chi tiết lỗi validation nếu có
      const errorMessage = error?.response?.data?.details 
        ? `Validation error: ${JSON.stringify(error.response.data.details)}`
        : error?.message || 'Không thể cập nhật trạng thái';
      toast.error(errorMessage);
      console.error('Update status error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContinueCheckout = () => {
    // Navigate to checkout with order ID (UUID)
    // useCheckout sẽ load order và restore cart
    navigate('/checkout', {
      state: { 
        orderId: order.id, // Sử dụng UUID thay vì orderNumber
        continueOrder: true 
      }
    });
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
      {/* Order Header */}
      <div className={`p-3 sm:p-4 ${statusConfig.bgColor} text-white flex-shrink-0`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="text-white">{statusConfig.icon}</div>
            <span className="font-semibold text-base sm:text-lg">
              {order.createdByName || (order.createdBy === 'staff' ? 'Nhân Viên' : 'Khách Hàng')}
            </span>
          </div>
          <div className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-semibold bg-white/20`}>
            {statusConfig.label}
          </div>
        </div>
        
        {/* Order ID & Customer Info */}
        <div className="space-y-1 text-sm">
          {order.orderId && (
            <div className="flex items-center space-x-2">
              <span className="opacity-90">Mã đơn:</span>
              <span className="font-bold">{order.orderId}</span>
            </div>
          )}
          {order.customerInfo?.name && (
            <div className="flex items-center space-x-2">
              <span className="opacity-90">Khách hàng:</span>
              <span className="font-semibold">{order.customerInfo.name}</span>
            </div>
          )}
          {order.customerInfo?.table && (
            <div className="flex items-center space-x-2">
              <span className="opacity-90">Bàn:</span>
              <span className="font-semibold">{order.customerInfo.table}</span>
            </div>
          )}
          {order.customerInfo?.phone && (
            <div className="flex items-center space-x-2">
              <span className="opacity-90">SĐT:</span>
              <span className="font-semibold">{order.customerInfo.phone}</span>
            </div>
          )}
        </div>

        {/* Payment Info */}
        {isPaidOrAfter && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="opacity-90">Thanh toán:</span>
                <span className="font-semibold">{getPaymentMethodText(order.paymentMethod)}</span>
              </div>
              {order.paidAt && (
                <div className="opacity-90">
                  {formatOrderTime(order.paidAt, currentTime)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="p-3 sm:p-4 flex-1 overflow-y-auto max-h-[300px] sm:max-h-[400px]">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{item.name}</div>
                {item.selectedSize && (
                  <div className="text-sm text-gray-600 mt-1">
                    Size: {item.selectedSize.name}
                  </div>
                )}
                {item.selectedToppings.length > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    Topping: {item.selectedToppings.map(t => t.name).join(', ')}
                  </div>
                )}
                {item.note && (
                  <div className="text-sm text-gray-500 italic mt-1">
                    Ghi chú: {item.note}
                  </div>
                )}
              </div>
              <div className="text-right ml-4">
                <div className="font-semibold text-gray-800">
                  {item.quantity}x
                </div>
                <div className="text-sm text-gray-600">
                  {formatPrice(item.totalPrice)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Footer */}
      <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <div className="space-y-2">
          {/* Tính toán VAT từ totalPrice (totalPrice đã bao gồm VAT) */}
          {/* Nếu totalPrice = X, thì giá gốc = X / 1.1, VAT = X - (X / 1.1) */}
          {(() => {
            const priceWithVAT = order.totalPrice;
            const priceWithoutVAT = priceWithVAT / 1.1;
            const vatAmount = priceWithVAT - priceWithoutVAT;
            
            return (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="text-gray-600">{formatPrice(priceWithoutVAT)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">VAT (10%):</span>
                  <span className="text-gray-600">{formatPrice(vatAmount)}</span>
                </div>
              </>
            );
          })()}
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-300">
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Tổng cộng</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-800">
                {formatPrice(order.totalPrice)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">{order.totalItems} món</div>
              <div className="text-xs text-gray-500">
                Cập nhật: {formatOrderTime(order.lastUpdated, currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between gap-2">
            {/* Chỉ hiển thị button cho CREATING (chưa thanh toán), các trường hợp khác đã hoàn thành */}
            {(order.backendStatus === 'CREATING' || (!order.backendStatus && order.status === 'creating')) ? (
              <button
                onClick={handleContinueCheckout}
                className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-semibold transition-colors text-sm"
              >
                Tiếp tục thanh toán
              </button>
            ) : (
              <>
                <div className="flex-1 text-center text-sm text-gray-600 flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Đã hoàn thành</span>
                </div>
                {/* Print button for completed orders */}
                {order.backendStatus !== 'CREATING' && order.status !== 'creating' && (
                  <PrintReceiptButton order={order} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

