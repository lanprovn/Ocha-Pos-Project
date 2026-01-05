import React from 'react';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onDecrease,
  onIncrease
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Số lượng</h3>
      <div className="flex items-center gap-4">
        <button
          onClick={onDecrease}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
        >
          -
        </button>
        <span className="text-lg font-semibold text-gray-800 min-w-[3rem] text-center transition-all duration-300">
          {quantity}
        </span>
        <button
          onClick={onIncrease}
          className="w-10 h-10 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center font-bold text-orange-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
        >
          +
        </button>
      </div>
    </div>
  );
};

