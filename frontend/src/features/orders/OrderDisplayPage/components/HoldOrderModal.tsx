import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { orderService } from '@features/orders/services/order.service';
import type { Order } from '@features/orders/services/order.service';
import { useCart } from '@features/orders/hooks/useCart';
import { useAuth } from '@features/auth/hooks/useAuth';
import { formatPrice } from '@/utils/formatPrice';
import toast from 'react-hot-toast';

interface HoldOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess?: () => void;
  createFromCart?: boolean; // If true, create order from current cart
}

export const HoldOrderModal: React.FC<HoldOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
  createFromCart = false,
}) => {
  const [holdName, setHoldName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { items, totalPrice } = useCart();
  const { user } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      // Auto-generate default name
      const defaultName = `Đơn tạm - ${new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })}`;
      setHoldName(defaultName);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // If creating from cart, check if cart has items
  if (createFromCart && items.length === 0) {
    toast.error('Giỏ hàng trống');
    onClose();
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      let orderId: string;

      if (createFromCart) {
        // Create draft order from cart first
        const orderItems = items.map((item) => ({
          productId: String(item.productId), // Convert to string
          quantity: item.quantity,
          price: item.basePrice,
          subtotal: item.totalPrice,
          selectedSize: item.selectedSize?.name || null,
          selectedToppings: item.selectedToppings.map(t => t.name),
          note: item.note || null,
        }));

        const draftOrder = await orderService.createOrUpdateDraft({
          orderCreator: 'STAFF',
          orderCreatorName: user?.name || 'Nhân Viên POS',
          items: orderItems,
        });

        orderId = draftOrder.id;
      } else {
        if (!order?.id) {
          toast.error('Không tìm thấy đơn hàng');
          return;
        }
        orderId = order.id;
      }

      // Hold the order
      await orderService.holdOrder(orderId, {
        holdName: holdName.trim() || null,
      });
      
      toast.success('Đã lưu đơn hàng tạm');
      onSuccess?.();
      onClose();
      setHoldName('');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Không thể lưu đơn hàng';
      toast.error(errorMessage);
      console.error('Hold order error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-[80%] max-w-[80vw] bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Lưu đơn hàng tạm</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isLoading}
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {order && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mã đơn:</span>
                    <span className="font-semibold text-gray-800">{order.orderNumber}</span>
                  </div>
                  {order.customerName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Khách hàng:</span>
                      <span className="font-semibold text-gray-800">{order.customerName}</span>
                    </div>
                  )}
                </>
              )}
              {createFromCart && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Số món:</span>
                  <span className="font-semibold text-gray-800">{items.length} món</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatPrice(createFromCart ? totalPrice : (order ? parseFloat(order.totalAmount) : 0))}
                </span>
              </div>
            </div>

            {/* Hold Name Input */}
            <div>
              <label htmlFor="holdName" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đơn hàng (tùy chọn)
              </label>
              <input
                id="holdName"
                type="text"
                value={holdName}
                onChange={(e) => setHoldName(e.target.value)}
                placeholder="VD: Đơn bàn 5, Đơn khách VIP..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Để trống sẽ tự động đặt tên theo thời gian
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  'Lưu đơn hàng'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
