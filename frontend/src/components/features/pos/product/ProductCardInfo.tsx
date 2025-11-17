import React from 'react';
import type { Product } from '../../../../types/product';
import { formatPrice } from '../../../../utils/formatPrice';

interface ProductCardInfoProps {
  product: Product;
}

/**
 * ProductCardInfo - Component for product information (name, price, sizes)
 */
export const ProductCardInfo: React.FC<ProductCardInfoProps> = ({ product }) => {
  return (
    <div className="p-4">
      <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-1">
        {product.name}
      </h3>
      
      {/* Price - Prominent */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-lg font-bold text-slate-700 product-card-price">
          {formatPrice(product.price)}
        </span>
        
        {/* Size Options Indicator */}
        {product.sizes && product.sizes.length > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 product-card-size-badge">
            {product.sizes.length} size
          </span>
        )}
      </div>
    </div>
  );
};

