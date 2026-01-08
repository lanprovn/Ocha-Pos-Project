import React from 'react';

interface SuccessMessageProps {
  orderCreator?: 'CUSTOMER' | 'STAFF';
  orderStatus?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ orderCreator, orderStatus }) => {
  const isCustomerOrder = orderCreator === 'CUSTOMER';
  const isPending = orderStatus === 'PENDING';

  return (
    <div className="text-center mb-3">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Đặt hàng thành công!
      </h1>
      <p className="text-sm text-gray-600">
        {isCustomerOrder && isPending ? (
          <>
            Cảm ơn bạn đã đặt hàng. <span className="font-semibold text-amber-600">Đơn hàng của bạn đang chờ nhân viên xác nhận.</span>
          </>
        ) : (
          'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.'
        )}
      </p>
    </div>
  );
};

