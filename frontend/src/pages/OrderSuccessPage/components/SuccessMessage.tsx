import React from 'react';

export const SuccessMessage: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        Đặt hàng thành công!
      </h1>
      <p className="text-lg text-gray-600">
        Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
      </p>
    </div>
  );
};

