import React from 'react';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useHoldOrders } from '@features/orders/hooks/useHoldOrders';
import { orderService } from '@features/orders/services/order.service';
import { formatPrice } from '@/utils/formatPrice';
import { formatOrderTime } from '../utils/orderDisplayUtils';
import toast from 'react-hot-toast';
import { useCart } from '@features/orders/hooks/useCart';
import { useNavigate } from 'react-router-dom';

interface HoldOrdersListProps {
  isOpen: boolean;
  onClose: () => void;
  onResume?: (orderId: string) => void;
}

export const HoldOrdersList: React.FC<HoldOrdersListProps> = ({
  isOpen,
  onClose,
  onResume,
}) => {
  const { holdOrders, isLoading, refetch, resumeHoldOrder } = useHoldOrders('STAFF');
  const { setCartItems } = useCart();
  const navigate = useNavigate();
  const [resumingId, setResumingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  if (!isOpen) return null;

  const handleResume = async (orderId: string) => {
    setResumingId(orderId);
    try {
      const order = await resumeHoldOrder(orderId);
      
      // Load order items into cart
      if (order.items && order.items.length > 0) {
        const cartItems = order.items.map((item) => ({
          productId: parseInt(item.productId, 10), // Convert string to number
          name: item.product.name,
          image: item.product.image,
          basePrice: parseFloat(item.price),
          selectedSize: item.selectedSize ? { name: item.selectedSize, extraPrice: 0 } : undefined,
          selectedToppings: item.selectedToppings.map(name => ({ name, extraPrice: 0 })),
          note: item.note || undefined,
          quantity: item.quantity,
          totalPrice: parseFloat(item.subtotal),
          preservePrice: true, // Preserve exact price from order
        }));
        
        setCartItems(cartItems);
        toast.success('Đã khôi phục đơn hàng');
        onResume?.(orderId);
        onClose();
        navigate('/');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Không thể khôi phục đơn hàng';
      toast.error(errorMessage);
    } finally {
      setResumingId(null);
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
        <div className="w-[80%] max-w-[80vw] bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Đơn hàng đã lưu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : holdOrders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-gray-500">Chưa có đơn hàng nào được lưu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {holdOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-800">{order.orderNumber}</span>
                          {order.holdName && (
                            <span className="text-sm text-gray-600">({order.holdName})</span>
                          )}
                        </div>
                        {order.customerName && (
                          <div className="text-sm text-gray-600 mb-1">
                            Khách hàng: {order.customerName}
                          </div>
                        )}
                        <div className="text-sm text-gray-600 mb-2">
                          {order.items?.length || 0} món • {formatPrice(parseFloat(order.totalAmount))}
                        </div>
                        <div className="text-xs text-gray-500">
                          Lưu lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleResume(order.id)}
                          disabled={resumingId === order.id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          {resumingId === order.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Đang khôi phục...</span>
                            </>
                          ) : (
                            <>
                              <ArrowPathIcon className="w-4 h-4" />
                              <span>Khôi phục</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
