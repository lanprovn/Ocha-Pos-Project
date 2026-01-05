import React from 'react';

interface ProductNotFoundProps {
  isCustomerDisplay: boolean;
  onBack: () => void;
}

export const ProductNotFound: React.FC<ProductNotFoundProps> = ({
  isCustomerDisplay,
  onBack
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-6">❌</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-3">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-gray-500 mb-6">
          Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <button
          onClick={onBack}
          className={`font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isCustomerDisplay
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white'
              : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white'
          }`}
        >
          {isCustomerDisplay ? 'Quay lại Menu' : 'Quay lại POS'}
        </button>
      </div>
    </div>
  );
};

