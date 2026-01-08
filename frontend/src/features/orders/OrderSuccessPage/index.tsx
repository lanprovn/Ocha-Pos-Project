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
    orderCreator,
    orderStatus,
    handleNewOrder,
    handleGoHome
  } = useOrderSuccess();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mb-4"></div>
        <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SuccessIcon />
        <SuccessMessage orderCreator={orderCreator} orderStatus={orderStatus} />

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
    </div>
  );
};

export default OrderSuccessPage;

