import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrderTracking } from '../../../types/display';
import { formatPrice } from '../../../utils/formatPrice';
import { formatOrderTime, getStatusConfig, getPaymentMethodText } from '../utils/orderDisplayUtils';
import { orderService } from '@services/order.service';
import toast from 'react-hot-toast';

interface OrderCardProps {
  order: OrderTracking;
  currentTime: Date;
  onStatusUpdate?: () => void;
}

// OPTIMIZED: Memoized to prevent unnecessary re-renders
export const OrderCard: React.FC<OrderCardProps> = memo(({ order, currentTime, onStatusUpdate }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const statusConfig = getStatusConfig(order.status);
  const isPaidOrAfter = ['paid', 'preparing', 'completed'].includes(order.status);
  const canCancel = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.backendStatus || '');
  const canRefund = order.paymentStatus === 'SUCCESS' && ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'].includes(order.backendStatus || '');
  const canPrint = ['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'].includes(order.backendStatus || '');
  
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
    // Navigate to checkout with order ID
    // Backend sẽ load draft order và restore cart
    navigate('/checkout', {
      state: { 
        orderId: order.orderId,
        continueOrder: true 
      }
    });
  };

  const handleCancelOrder = async () => {
    if (!order.id || isCancelling) return;
    const reason = window.prompt('Lý do hủy đơn hàng (tùy chọn):');
    if (reason === null) return; // User cancelled prompt
    
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(order.id, reason || undefined);
      toast.success('Đã hủy đơn hàng thành công');
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.message || 'Không thể hủy đơn hàng');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRefundOrder = async () => {
    if (!order.id || isRefunding) return;
    const refundReason = window.prompt('Lý do hoàn tiền (tùy chọn):');
    if (refundReason === null) return; // User cancelled prompt
    
    if (!window.confirm(`Bạn có chắc chắn muốn hoàn tiền cho đơn hàng ${order.orderId}?`)) {
      return;
    }
    
    setIsRefunding(true);
    try {
      await orderService.refundOrder(order.id, refundReason || undefined);
      toast.success('Đã hoàn tiền thành công');
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.message || 'Không thể hoàn tiền');
    } finally {
      setIsRefunding(false);
    }
  };

  const handlePrintReceipt = async () => {
    if (!order.id || isPrinting) return;
    
    setIsPrinting(true);
    try {
      const receipt = await orderService.getReceipt(order.id);
      
      // Open print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.');
        return;
      }

      // Format receipt HTML
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Hóa đơn ${receipt.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OCHA VIỆT POS</h1>
            <p>Hóa đơn: ${receipt.orderNumber}</p>
            <p>Ngày: ${new Date(receipt.date).toLocaleString('vi-VN')}</p>
          </div>
          <div class="info">
            <p><strong>Khách hàng:</strong> ${receipt.customerName}</p>
            ${receipt.customerPhone ? `<p><strong>SĐT:</strong> ${receipt.customerPhone}</p>` : ''}
            ${receipt.customerTable ? `<p><strong>Bàn:</strong> ${receipt.customerTable}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Tên món</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatPrice(item.price)}</td>
                  <td>${formatPrice(item.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Tổng cộng: ${formatPrice(receipt.total)}</p>
            <p>Phương thức: ${receipt.paymentMethod === 'CASH' ? 'Tiền mặt' : 'QR Code'}</p>
          </div>
          ${receipt.notes ? `<p><strong>Ghi chú:</strong> ${receipt.notes}</p>` : ''}
          <p style="text-align: center; margin-top: 30px;">Cảm ơn quý khách!</p>
        </body>
        </html>
      `;

      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast.success('Đã mở cửa sổ in hóa đơn');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.message || 'Không thể in hóa đơn');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 animate-scale-in h-full flex flex-col">
      {/* Order Header */}
      <div className={`p-3 sm:p-4 ${statusConfig.bgColor} text-white flex-shrink-0`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{statusConfig.icon}</span>
            <span className="font-semibold text-base sm:text-lg">
              {order.createdByName || (order.createdBy === 'staff' ? 'Nhân Viên' : 'Khách Hàng')}
            </span>
          </div>
          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-sm`}>
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
              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
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
          {/* Sử dụng backendStatus để check chính xác */}
          {order.backendStatus === 'CREATING' && (
            <button
              onClick={handleContinueCheckout}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              Tiếp tục thanh toán
            </button>
          )}
          {order.backendStatus === 'PENDING' && (
            <button
              onClick={() => handleStatusUpdate('CONFIRMED')}
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-50"
            >
              {isUpdating ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
            </button>
          )}
          {order.backendStatus === 'CONFIRMED' && (
            <button
              onClick={() => handleStatusUpdate('PREPARING')}
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-50"
            >
              {isUpdating ? 'Đang xử lý...' : 'Bắt đầu chuẩn bị'}
            </button>
          )}
          {order.backendStatus === 'PREPARING' && (
            <button
              onClick={() => handleStatusUpdate('READY')}
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-50"
            >
              {isUpdating ? 'Đang xử lý...' : 'Sẵn sàng'}
            </button>
          )}
          {order.backendStatus === 'READY' && (
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-50"
            >
              {isUpdating ? 'Đang xử lý...' : 'Hoàn thành'}
            </button>
          )}
          {order.backendStatus === 'COMPLETED' && (
            <div className="text-center text-sm text-gray-500">
              ✅ Đơn hàng đã hoàn thành
            </div>
          )}
          
          {/* Additional Actions */}
          <div className="mt-2 flex flex-wrap gap-2">
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Đang hủy...' : 'Hủy đơn'}
              </button>
            )}
            {canRefund && (
              <button
                onClick={handleRefundOrder}
                disabled={isRefunding}
                className="flex-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isRefunding ? 'Đang hoàn...' : 'Hoàn tiền'}
              </button>
            )}
            {canPrint && (
              <button
                onClick={handlePrintReceipt}
                disabled={isPrinting}
                className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isPrinting ? 'Đang in...' : 'In hóa đơn'}
              </button>
            )}
          </div>
          {/* Fallback nếu không có backendStatus (cho tương thích ngược) */}
          {!order.backendStatus && order.status === 'creating' && (
            <button
              onClick={handleContinueCheckout}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              Tiếp tục thanh toán
            </button>
          )}
          {!order.backendStatus && order.status === 'paid' && (
            <button
              onClick={() => handleStatusUpdate('PREPARING')}
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-50"
            >
              {isUpdating ? 'Đang xử lý...' : 'Bắt đầu chuẩn bị'}
            </button>
          )}
          {!order.backendStatus && order.status === 'preparing' && (
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-50"
            >
              {isUpdating ? 'Đang xử lý...' : 'Hoàn thành'}
            </button>
          )}
          {!order.backendStatus && order.status === 'completed' && (
            <div className="text-center text-sm text-gray-500">
              ✅ Đơn hàng đã hoàn thành
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

OrderCard.displayName = 'OrderCard';

