"use client";
import React from 'react';
import type { Size } from '@/types/product';
import { formatPrice } from '../utils/productCalculations';

interface SizeSelectorProps {
  sizes: Size[];
  selectedSize: Size | undefined;
  onSelectSize: (size: Size) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSelectSize
}) => {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Chọn size</h3>
      <div className="grid grid-cols-3 gap-3">
        {sizes.map((size) => (
          <button
            key={size.name}
            onClick={() => onSelectSize(size)}
            className={`p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
              selectedSize?.name === size.name
                ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-700 bg-white'
            }`}
          >
            <div className="font-semibold text-sm">{size.name}</div>
            {size.extraPrice > 0 && (
              <div className="text-xs text-gray-500">
                +{formatPrice(size.extraPrice)}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

