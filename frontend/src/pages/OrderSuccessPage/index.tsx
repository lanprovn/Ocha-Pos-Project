import React from 'react';
import { useOrderSuccess } from './hooks/useOrderSuccess';
import { SuccessIcon } from './components/SuccessIcon';
import { SuccessMessage } from './components/SuccessMessage';
import { OrderInfoCard } from './components/OrderInfoCard';
import { ActionButtons } from './components/ActionButtons';

const OrderSuccessPage: React.FC = () => {
  const {
    orderDetails,
    paymentMethod,
    isLoading,
    handleNewOrder,
    handleGoHome
  } = useOrderSuccess();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SuccessIcon />
        <SuccessMessage />

        {orderDetails && (
          <OrderInfoCard 
            orderDetails={orderDetails}
            paymentMethod={paymentMethod}
          />
        )}

        <ActionButtons 
          onNewOrder={handleNewOrder}
          onGoHome={handleGoHome}
          orderId={orderDetails?.id}
          orderNumber={orderDetails?.orderNumber}
        />
      </div>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessPage;

