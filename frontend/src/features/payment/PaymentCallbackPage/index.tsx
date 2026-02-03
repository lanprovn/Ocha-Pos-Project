import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@constants';
import { useCart } from '@features/orders/hooks/useCart';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const success = searchParams.get('success') === 'true';
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error');

  useEffect(() => {
    if (success && orderId) {
      // Thanh toán thành công - clear cart và redirect đến order success
      clearCart();
      setTimeout(() => {
        navigate(ROUTES.ORDER_SUCCESS, {
          state: { orderId },
          replace: true,
        });
      }, 2000);
    } else if (error) {
      // Thanh toán thất bại - redirect về checkout với error message
      setTimeout(() => {
        navigate(ROUTES.CHECKOUT, {
          state: { 
            error: error === 'payment_failed' 
              ? 'Thanh toán thất bại. Vui lòng thử lại.' 
              : 'Có lỗi xảy ra trong quá trình thanh toán.',
            orderId: orderId || undefined,
          },
          replace: true,
        });
      }, 2000);
    } else {
      // Không có thông tin - redirect về checkout
      setTimeout(() => {
        navigate(ROUTES.CHECKOUT, { replace: true });
      }, 2000);
    }
  }, [success, orderId, error, navigate, clearCart]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
        {success ? (
          <>
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              Đơn hàng của bạn đã được xử lý thành công.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Đang chuyển hướng...</p>
          </>
        ) : error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600 mb-4">
              {error === 'payment_failed' 
                ? 'Thanh toán không thành công. Vui lòng thử lại.' 
                : 'Có lỗi xảy ra trong quá trình thanh toán.'}
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Đang chuyển về trang thanh toán...</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              Đang xử lý...
            </h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Vui lòng đợi...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;

