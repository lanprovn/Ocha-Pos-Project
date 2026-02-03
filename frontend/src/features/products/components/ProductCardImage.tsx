import React from 'react';
import type { Product } from '@/types/product';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardImageProps {
  product: Product;
  onInfoClick: (e: React.MouseEvent) => void;
}

/**
 * ProductCardImage - Luxury Image display with hover effects
 */
export const ProductCardImage: React.FC<ProductCardImageProps> = ({ product, onInfoClick }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop';
  };

  return (
    <div className="relative w-full h-full overflow-hidden group">
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={handleImageError}
      />

      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Info Button - Top Left */}
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
        <Button
          variant="secondary"
          size="icon"
          onClick={onInfoClick}
          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
        >
          <Info className="w-4 h-4 text-slate-700" />
        </Button>
      </div>
    </div>
  );
};
