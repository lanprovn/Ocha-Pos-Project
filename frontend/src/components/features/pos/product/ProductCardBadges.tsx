import React from 'react';
import type { Product } from '../../../../types/product';
import { useProductStock } from '../../../../hooks/useProductStock';

interface ProductCardBadgesProps {
  product: Product;
}

/**
 * ProductCardBadges - Component for product badges (Popular, Stock Availability)
 */
export const ProductCardBadges: React.FC<ProductCardBadgesProps> = ({ product }) => {
  const { isInStock, isOutOfStock, isLowStock, getStockQuantity } = useProductStock();
  
  // Convert product.id to string for stock lookup (backend uses UUID string)
  const productId = typeof product.id === 'number' ? product.id.toString() : product.id;
  const stockQuantity = getStockQuantity(productId);
  const outOfStock = isOutOfStock(productId);
  const lowStock = isLowStock(productId);
  const inStock = isInStock(productId);

  return (
    <>
      {/* Popular Badge */}
      {product.isPopular && (
        <div className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold leading-none bg-slate-700 text-white shadow-sm product-card-popular-badge z-10">
          Phổ biến
        </div>
      )}
      
      {/* Stock Availability Badge */}
      {outOfStock ? (
        <div className="absolute bottom-2 left-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold leading-none bg-red-600 text-white shadow-sm product-card-stock-badge z-10">
          Hết hàng
        </div>
      ) : lowStock ? (
        <div className="absolute bottom-2 left-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold leading-none bg-amber-600 text-white shadow-sm product-card-stock-badge z-10">
          Sắp hết ({stockQuantity})
        </div>
      ) : inStock && stockQuantity > 0 ? (
        <div className="absolute bottom-2 left-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold leading-none bg-green-600 text-white shadow-sm product-card-stock-badge z-10">
          Còn hàng
        </div>
      ) : null}
    </>
  );
};

