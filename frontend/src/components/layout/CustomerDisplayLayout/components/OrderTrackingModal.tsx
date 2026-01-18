import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { orderService } from '@features/orders/services/order.service';
import { subscribeToOrders } from '@lib/socket.service';
import type { Order } from '@features/orders/services/order.service';
import { formatPrice } from '@/utils/formatPrice';
import toast from 'react-hot-toast';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId,
}) => {
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialOrderId) {
      setOrderId(initialOrderId);
      loadOrder(initialOrderId);
    }
  }, [isOpen, initialOrderId]);

  const loadOrder = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      // Try to find by phone or order number (new API)
      const orderData = await orderService.findByPhoneOrOrderNumber(searchTerm.trim());
      setOrder(orderData);
    } catch (error: any) {
      console.error('Error loading order:', error);
      // If new API fails, try old API (for UUID)
      try {
        const orderData = await orderService.getById(searchTerm.trim());
        setOrder(orderData);
      } catch (fallbackError: any) {
        toast.error('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại số điện thoại hoặc mã đơn hàng');
        setOrder(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to order updates via Socket.io
  useEffect(() => {
    if (!order?.id) return;

    const cleanup = subscribeToOrders(
      undefined, // onOrderCreated
      (updatedOrder: Order) => {
        if (updatedOrder.id === order.id) {
          setOrder(updatedOrder);
        }
      },
      undefined // onOrderRemoved
    );

    return cleanup;
  }, [order?.id]);

  const handleSearch = () => {
    if (!orderId.trim()) {
      toast.error('Vui lòng nhập mã đơn hàng hoặc số điện thoại');
      return;
    }
    loadOrder(orderId.trim());
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      CREATING: 'Đang tạo',
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PREPARING: 'Đang chuẩn bị',
      READY: 'Sẵn sàng',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      CREATING: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-orange-100 text-orange-800',
      READY: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-[80%] max-h-[90vh] my-auto transform transition-all flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b">
            <h3 className="text-lg font-medium text-gray-900">Theo dõi đơn hàng</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập mã đơn hàng hoặc số điện thoại
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nhập mã đơn hàng hoặc số điện thoại..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Bạn có thể tìm kiếm bằng mã đơn hàng (ví dụ: ORD-123456) hoặc số điện thoại đã đặt hàng
              </p>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
              </div>
            )}

            {/* Order Details */}
            {!isLoading && order && (
              <div className="space-y-6">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.orderNumber}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Khách hàng</p>
                      <p className="font-semibold text-gray-900">{order.customerName || 'Khách hàng'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng tiền</p>
                      <p className="font-bold text-lg text-orange-600">{formatPrice(parseFloat(order.totalAmount))}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết đơn hàng</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.product.name}</p>
                            {item.selectedSize && (
                              <p className="text-sm text-gray-600 mt-1">Size: {item.selectedSize}</p>
                            )}
                            {item.selectedToppings && item.selectedToppings.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                Topping: {item.selectedToppings.join(', ')}
                              </p>
                            )}
                            {item.note && (
                              <p className="text-sm text-gray-500 italic mt-1">Ghi chú: {item.note}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-2">Số lượng: {item.quantity}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-gray-900">{formatPrice(parseFloat(item.subtotal))}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                {order.paymentMethod && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                    <p className="font-semibold text-gray-900">
                      {order.paymentMethod === 'CASH' ? 'Tiền mặt' :
                       order.paymentMethod === 'CARD' ? 'Thẻ ngân hàng' :
                       order.paymentMethod === 'QR' ? 'QR Code' : order.paymentMethod}
                    </p>
                    {order.paymentStatus && (
                      <p className={`text-sm mt-1 ${
                        order.paymentStatus === 'SUCCESS' ? 'text-green-600' :
                        order.paymentStatus === 'PENDING' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {order.paymentStatus === 'SUCCESS' ? 'Đã thanh toán' :
                         order.paymentStatus === 'PENDING' ? 'Chờ thanh toán' :
                         'Thanh toán thất bại'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* No Order Found */}
            {!isLoading && !order && orderId && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy đơn hàng</h3>
                <p className="text-sm text-gray-500">Vui lòng kiểm tra lại mã đơn hàng</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !order && !orderId && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nhập mã đơn hàng hoặc số điện thoại để theo dõi</h3>
                <p className="text-sm text-gray-500">Mã đơn hàng được gửi đến bạn sau khi đặt hàng thành công</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTrackingModal;

