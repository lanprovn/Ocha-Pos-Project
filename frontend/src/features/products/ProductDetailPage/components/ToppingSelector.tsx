import React from 'react';
import type { Topping } from '@/types/product';
import { formatPrice } from '../utils/productCalculations';

interface ToppingSelectorProps {
  toppings: Topping[];
  selectedToppings: Topping[];
  onToggleTopping: (topping: Topping) => void;
}

export const ToppingSelector: React.FC<ToppingSelectorProps> = ({
  toppings,
  selectedToppings,
  onToggleTopping
}) => {
  if (!toppings || toppings.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Chọn topping</h3>
      <div className="grid grid-cols-2 gap-3">
        {toppings.map((topping) => {
          const isSelected = selectedToppings.some(t => t.name === topping.name);
          return (
            <button
              key={topping.name}
              onClick={() => onToggleTopping(topping)}
              className={`p-3 rounded-lg border-2 transition-all duration-300 text-left transform hover:scale-105 relative ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-700 bg-white'
              }`}
            >
              <div className="font-semibold text-sm flex items-center justify-between">
                <span>{topping.name}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-orange-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {topping.extraPrice > 0 && (
                <div className="text-xs text-gray-500">
                  +{formatPrice(topping.extraPrice)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

