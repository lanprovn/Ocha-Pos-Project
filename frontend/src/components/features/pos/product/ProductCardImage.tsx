import React from 'react';
import type { Product } from '../../../../types/product';

interface ProductCardImageProps {
  product: Product;
  onInfoClick: (e: React.MouseEvent) => void;
}

/**
 * ProductCardImage - Component for product image with info button
 */
export const ProductCardImage: React.FC<ProductCardImageProps> = ({ product, onInfoClick }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/src/assets/img/gallery/default-food.png';
  };

  return (
    <>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover product-card-image"
        onError={handleImageError}
      />
      
      {/* Info Icon - Top Right */}
      <button
        onClick={onInfoClick}
        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md z-10 product-card-info-btn"
        title="Xem chi tiết"
        aria-label="Xem chi tiết sản phẩm"
      >
        <svg 
          className="w-4 h-4 text-gray-600 product-card-info-icon"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </>
  );
};

