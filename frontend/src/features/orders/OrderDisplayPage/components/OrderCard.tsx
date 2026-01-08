import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrderTracking } from '@/types/display';
import { formatPrice } from '@/utils/formatPrice';
import { formatOrderTime, getStatusConfig, getPaymentMethodText } from '../utils/orderDisplayUtils';
import { orderService } from '@features/orders/services/order.service';
import { useAuth } from '@features/auth/hooks/useAuth';
import PrintReceiptButton from './PrintReceiptButton';
import PrintPreviewButton from './PrintPreviewButton';
import { HoldOrderModal } from './HoldOrderModal';
import { CancelOrderModal } from './CancelOrderModal';
import toast from 'react-hot-toast';

interface OrderCardProps {
  order: OrderTracking;
  currentTime: Date;
  onStatusUpdate?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, currentTime, onStatusUpdate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const statusConfig = getStatusConfig(order.status);
  const isPaidOrAfter = ['paid', 'preparing', 'completed'].includes(order.status);
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';
  const isPendingVerification = order.status === 'pending_verification';
  const canHold = order.backendStatus === 'PENDING' || order.backendStatus === 'CREATING' || (!order.backendStatus && (order.status === 'creating'));
  const canCancel = order.backendStatus !== 'COMPLETED' && order.backendStatus !== 'CANCELLED' && order.status !== 'completed';
  const isHold = order.backendStatus === 'HOLD' || order.status === 'hold';
  const canPrintPreview = order.backendStatus === 'PENDING' || order.backendStatus === 'HOLD' || (!order.backendStatus && (order.status === 'hold'));
  
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

  const handleVerifyOrder = async () => {
    if (!order.id || isVerifying || isRejecting) return;
    
    setIsVerifying(true);
    try {
      await orderService.verifyOrder(order.id);
      toast.success('Đã xác nhận đơn hàng');
      onStatusUpdate?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Không thể xác nhận đơn hàng';
      toast.error(errorMessage);
      console.error('Verify order error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!order.id || isVerifying || isRejecting) return;
    
    const reason = prompt('Lý do từ chối đơn hàng (tùy chọn):');
    if (reason === null) return; // User cancelled
    
    setIsRejecting(true);
    try {
      await orderService.rejectOrder(order.id, reason || undefined);
      toast.success('Đã từ chối đơn hàng');
      onStatusUpdate?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Không thể từ chối đơn hàng';
      toast.error(errorMessage);
      console.error('Reject order error:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  // Convert OrderTracking to Order for modals
  const convertToOrder = (): import('@features/orders/services/order.service').Order | null => {
    if (!order.id) return null;
    return {
      id: order.id,
      orderNumber: order.orderId || order.id,
      status: (order.backendStatus || order.status.toUpperCase()) as any,
      totalAmount: order.totalPrice.toString(),
      customerName: order.customerInfo?.name || null,
      customerPhone: order.customerInfo?.phone || null,
      customerTable: order.customerInfo?.table || null,
      notes: null,
      paymentMethod: order.paymentMethod?.toUpperCase() as any || null,
      paymentStatus: order.paymentStatus?.toUpperCase() as any || 'PENDING',
      orderCreator: order.createdBy.toUpperCase() as any,
      orderCreatorName: order.createdByName || null,
      confirmedBy: null,
      confirmedAt: null,
      paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : null,
      createdAt: new Date(order.timestamp).toISOString(),
      updatedAt: new Date(order.lastUpdated).toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: String(item.productId), // Convert to string
        quantity: item.quantity,
        price: (item.totalPrice / item.quantity).toString(),
        subtotal: item.totalPrice.toString(),
        selectedSize: item.selectedSize?.name || null,
        selectedToppings: item.selectedToppings.map(t => t.name),
        note: item.note || null,
        product: {
          id: String(item.productId), // Convert to string
          name: item.name,
          image: item.image || '',
        },
      })),
    };
  };

  const handleHoldSuccess = () => {
    onStatusUpdate?.();
  };

  const handleCancelSuccess = () => {
    onStatusUpdate?.();
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
          {/* Pending Verification Actions (Staff Only) */}
          {isPendingVerification && isStaff ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyOrder}
                disabled={isVerifying || isRejecting}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-semibold transition-colors text-sm flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Xác Nhận</span>
                  </>
                )}
              </button>
              <button
                onClick={handleRejectOrder}
                disabled={isVerifying || isRejecting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-semibold transition-colors text-sm flex items-center justify-center space-x-2"
              >
                {isRejecting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Từ Chối</span>
                  </>
                )}
              </button>
            </div>
          ) : isPendingVerification && !isStaff ? (
            // Customer view: Show waiting badge
            <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-100 border border-amber-300 rounded-md">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-amber-800 font-semibold text-sm">⏳ Đang chờ nhân viên xác nhận</span>
            </div>
          ) : (order.backendStatus === 'CREATING' || (!order.backendStatus && order.status === 'creating')) ? (
            // Creating status: Show continue checkout button
            <button
              onClick={handleContinueCheckout}
              className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-semibold transition-colors text-sm"
            >
              Tiếp tục thanh toán
            </button>
          ) : (
            // Other statuses - Show action buttons
            <div className="flex flex-wrap gap-2">
              {/* Resume Hold Order Button */}
              {isHold && isStaff && (
                <button
                  onClick={async () => {
                    if (!order.id) return;
                    setIsUpdating(true);
                    try {
                      await orderService.resumeHoldOrder(order.id);
                      toast.success('Đã khôi phục đơn hàng');
                      onStatusUpdate?.();
                    } catch (error: any) {
                      const errorMessage = error?.response?.data?.error || error?.message || 'Không thể khôi phục đơn hàng';
                      toast.error(errorMessage);
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-semibold transition-colors text-xs sm:text-sm flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isUpdating ? 'Đang xử lý...' : 'Khôi phục'}</span>
                </button>
              )}

              {/* Hold Order Button */}
              {canHold && isStaff && !isHold && (
                <button
                  onClick={() => setShowHoldModal(true)}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors text-xs sm:text-sm flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Lưu đơn</span>
                </button>
              )}

              {/* Cancel Order Button */}
              {canCancel && isStaff && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors text-xs sm:text-sm flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Hủy đơn</span>
                </button>
              )}

              {/* Print Preview Button */}
              {canPrintPreview && isStaff && (
                <PrintPreviewButton order={order} />
              )}

              {/* Status Update Buttons for Staff */}
              {isStaff && order.backendStatus && ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.backendStatus) && (
                <>
                  {order.backendStatus === 'PENDING' && (
                    <button
                      onClick={() => handleStatusUpdate('CONFIRMED')}
                      disabled={isUpdating}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-md text-xs sm:text-sm transition-colors"
                    >
                      Xác nhận
                    </button>
                  )}
                  {order.backendStatus === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusUpdate('PREPARING')}
                      disabled={isUpdating}
                      className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-md text-xs sm:text-sm transition-colors"
                    >
                      Chuẩn bị
                    </button>
                  )}
                  {order.backendStatus === 'PREPARING' && (
                    <button
                      onClick={() => handleStatusUpdate('READY')}
                      disabled={isUpdating}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md text-xs sm:text-sm transition-colors"
                    >
                      Sẵn sàng
                    </button>
                  )}
                  {order.backendStatus === 'READY' && (
                    <button
                      onClick={() => handleStatusUpdate('COMPLETED')}
                      disabled={isUpdating}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md text-xs sm:text-sm transition-colors"
                    >
                      Hoàn thành
                    </button>
                  )}
                </>
              )}

              {/* Print button for completed orders */}
              {order.backendStatus === 'COMPLETED' && (
                <PrintReceiptButton order={order} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <HoldOrderModal
        isOpen={showHoldModal}
        onClose={() => setShowHoldModal(false)}
        order={convertToOrder()}
        onSuccess={handleHoldSuccess}
      />
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        order={convertToOrder()}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
};

