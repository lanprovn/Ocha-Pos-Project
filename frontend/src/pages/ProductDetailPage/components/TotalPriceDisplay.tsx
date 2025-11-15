import React from 'react';
import { formatPrice, calculateTotalPrice } from '../utils/productCalculations';
import type { Product } from '../../../types/product';
import type { Size, Topping } from '../../../types/product';

interface TotalPriceDisplayProps {
  product: Product;
  selectedSize: Size | undefined;
  selectedToppings: Topping[];
  quantity: number;
}

export const TotalPriceDisplay: React.FC<TotalPriceDisplayProps> = ({
  product,
  selectedSize,
  selectedToppings,
  quantity
}) => {
  const totalPrice = calculateTotalPrice(product, selectedSize, selectedToppings, quantity);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
        <span className="text-2xl font-bold text-orange-500 transition-all duration-300 hover:scale-110 inline-block">
          {formatPrice(totalPrice)}
        </span>
      </div>
    </div>
  );
};

