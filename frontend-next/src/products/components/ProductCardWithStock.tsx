"use client";
import React from 'react';
import type { Product } from '@/types/product';
import { formatPrice } from '@/utils/formatPrice';

interface ProductCardWithStockProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCardWithStock: React.FC<ProductCardWithStockProps> = ({ product, onAddToCart }) => {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-105">
      {/* Product Image */}
      <div className="aspect-w-16 aspect-h-12 bg-gray-200 relative">
        <img
          src={product.image || '/placeholder-food.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-food.jpg';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-orange-500">
            {formatPrice(product.price)}
          </span>
          
          {/* Size Options */}
          {product.sizes && product.sizes.length > 0 && (
            <span className="text-sm text-gray-500">
              {product.sizes.length} size
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-orange-500 text-white hover:bg-orange-600"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCardWithStock;