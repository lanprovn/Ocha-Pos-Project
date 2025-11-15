import React from 'react';

interface ActionButtonsProps {
  onNewOrder: () => void;
  onGoHome: () => void;
  orderId?: string;
  orderNumber?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onNewOrder,
  onGoHome,
  orderId,
  orderNumber
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-scale-in" style={{ animationDelay: '0.3s' }}>
      <button
        onClick={onNewOrder}
        className="w-full sm:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Đặt đơn mới</span>
      </button>
      
      <button
        onClick={onGoHome}
        className="w-full sm:w-auto px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Về trang chủ</span>
      </button>

      {orderId && (
        <button
          onClick={() => {
            // Navigate to order tracking if needed
            window.location.href = `/customer/order-tracking?orderId=${orderId}`;
          }}
          className="w-full sm:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Theo dõi đơn hàng</span>
        </button>
      )}
    </div>
  );
};

