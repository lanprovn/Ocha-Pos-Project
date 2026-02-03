import React, { memo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import type { Product } from '@/types/product';
import { ProductCardImage } from './ProductCardImage';
import { ProductCardBadges } from './ProductCardBadges';
import { ProductCardInfo } from './ProductCardInfo';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onQuickAdd?: (product: Product) => void;
}

/**
 * ProductCard - Luxury Product Card Transformation
 * Premium look and feel for modern POS systems
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
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-500 cursor-pointer overflow-hidden active:scale-[0.98]"
    >
      {/* Visual Canvas (Image Area) */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <ProductCardImage
          product={product}
          onInfoClick={handleInfoClick}
        />
        <ProductCardBadges product={product} />

        {/* Favorite Button (Premium) */}
        {isCustomerDisplay && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className={cn(
              "absolute top-2 right-2 w-8 h-8 rounded-full z-20 backdrop-blur-md transition-all",
              favorite
                ? "bg-rose-500 text-white shadow-lg shadow-rose-200"
                : "bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white"
            )}
          >
            <Heart className={cn("w-4 h-4", favorite && "fill-current")} />
          </Button>
        )}

        {/* Action Button (Smart POS Style) */}
        {!isCustomerDisplay && onQuickAdd && (
          <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-30">
            <Button
              onClick={handleQuickAdd}
              className="w-full bg-slate-900/90 backdrop-blur-md text-white border-none h-9 rounded-xl font-bold text-xs uppercase tracking-widest gap-2 shadow-lg active:scale-95"
            >
              <Plus className="w-3 h-3" /> Quick Add
            </Button>
          </div>
        )}

        {/* For Customer Display style quick add */}
        {isCustomerDisplay && onQuickAdd && (
          <Button
            onClick={handleQuickAdd}
            size="icon"
            className="absolute bottom-2 right-2 w-10 h-10 bg-slate-900 hover:bg-black rounded-xl z-20 shadow-xl text-white transition-all active:scale-90"
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Info Canvas */}
      <ProductCardInfo product={product} />
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
