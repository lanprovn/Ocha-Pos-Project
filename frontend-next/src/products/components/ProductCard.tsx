"use client";
import React, { memo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import type { Product } from '@/types/product';
import { ProductCardImage } from './ProductCardImage';
import { ProductCardBadges } from './ProductCardBadges';
import { ProductCardInfo } from './ProductCardInfo';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onQuickAdd?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onClick, onQuickAdd }) => {
  const location = usePathname();
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-shadow duration-300 cursor-pointer overflow-hidden"
    >
      <div className="relative h-44 overflow-hidden bg-slate-50">
        <ProductCardImage
          product={product}
          onInfoClick={handleInfoClick}
        />
        <ProductCardBadges product={product} />

        {isCustomerDisplay && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className={cn(
              "absolute top-3 right-3 w-9 h-9 rounded-full z-20 backdrop-blur-md transition-all",
              favorite
                ? "bg-rose-500 text-white shadow-lg shadow-rose-200 scale-110"
                : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white"
            )}
          >
            <Heart className={cn("w-4 h-4", favorite && "fill-current")} />
          </Button>
        )}

        {!isCustomerDisplay && onQuickAdd && (
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-all duration-300 z-30 opacity-0 group-hover:opacity-100">
            <Button
              onClick={handleQuickAdd}
              className="w-full bg-slate-900 text-white border-none h-11 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] gap-2 shadow-2xl active:scale-95"
            >
              <Plus className="w-4 h-4" /> THÊM NHANH
            </Button>
          </div>
        )}
      </div>

      <ProductCardInfo product={product} />
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
