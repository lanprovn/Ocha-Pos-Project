import React from 'react';
import { formatPrice } from '../../../utils/formatPrice';

interface CompleteOrderButtonProps {
  totalPrice: number;
  itemsCount: number;
  isProcessing: boolean;
  isFormValid: boolean;
  onComplete: () => void;
}

export const CompleteOrderButton: React.FC<CompleteOrderButtonProps> = ({
  totalPrice,
  itemsCount,
  isProcessing,
  isFormValid,
  onComplete
}) => {
  // Tính VAT 10% và tổng cuối cùng
  const vat = totalPrice * 0.1;
  const finalTotal = totalPrice + vat;

  return (
    <div className="space-y-4">
      {/* Hiển thị tổng cộng có VAT */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Tổng cộng:</span>
          <span className="text-xl font-bold text-orange-500">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      {/* Nút hoàn tất */}
      <div className="text-center">
        <button
          onClick={onComplete}
          disabled={!isFormValid || itemsCount === 0 || isProcessing}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2 mx-auto min-w-[200px] w-full"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <span>✓</span>
              <span>Hoàn tất đơn hàng</span>
              <span className="opacity-80">({formatPrice(finalTotal)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

