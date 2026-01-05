import React, { memo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import type { Product } from '@/types/product';
import { ProductCardImage } from './ProductCardImage';
import { ProductCardBadges } from './ProductCardBadges';
import { ProductCardInfo } from './ProductCardInfo';
import { useFavorites } from '@/hooks/useFavorites';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onQuickAdd?: (product: Product) => void;
}

/**
 * ProductCard - Main component for displaying product cards
 * Refactored to use smaller sub-components for better maintainability
 */
const ProductCard: React.FC<ProductCardProps> = memo(({ product, onClick, onQuickAdd }) => {
  const location = useLocation();
  const isCustomerDisplay = location.pathname.startsWith('/customer');
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleInfoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  }, [onClick]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  }, [product.id, toggleFavorite]);

  const handleQuickAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(product);
    }
  }, [product, onQuickAdd]);

  const favorite = isFavorite(product.id);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden cursor-pointer min-h-[44px] min-w-[44px] group product-card-container hover:shadow-md hover:border-gray-400 transition-all relative"
    >
      {/* Product Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <ProductCardImage 
          product={product} 
          onInfoClick={handleInfoClick}
        />
        <ProductCardBadges product={product} />
        
        {/* Favorite Button - Top Right (only for customer display) */}
        {isCustomerDisplay && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md z-10 hover:bg-white transition-colors"
            title={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            aria-label={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          >
            <svg 
              className={`w-5 h-5 transition-colors ${favorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
              fill={favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Quick Add Button - Bottom Right (only for customer display) */}
        {isCustomerDisplay && onQuickAdd && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-2 right-2 w-10 h-10 bg-slate-700 hover:bg-slate-800 rounded-md flex items-center justify-center shadow-sm z-10 text-white transition-colors"
            title="Thêm nhanh vào giỏ"
            aria-label="Thêm nhanh vào giỏ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>

      {/* Product Info Section */}
      <ProductCardInfo product={product} />
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
