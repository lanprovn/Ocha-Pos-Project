import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import type { Product } from '@/types/product';
import { formatPrice } from '../utils/productCalculations';

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 transition-all duration-300 hover:text-orange-600">
        {product.name}
      </h1>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200 transition-all duration-300 hover:shadow-md">
          <StarIcon className="h-5 w-5 text-yellow-400 mr-1 animate-pulse" />
          <span className="text-gray-600 font-medium">
            {product.rating} • {product.restaurant}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-6 leading-relaxed transition-all duration-300">
        {product.description}
      </p>

      <div className="space-y-2">
        <div className="text-3xl font-bold text-orange-500 transition-all duration-300 hover:scale-105 inline-block">
          {formatPrice(product.price)}
        </div>
      </div>
    </div>
  );
};

