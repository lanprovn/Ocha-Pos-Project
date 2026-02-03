"use client";

import React, { useState } from 'react';
import type { Product } from '@/types/product';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ProductCardImageProps {
  product: Product;
  onInfoClick: (e: React.MouseEvent) => void;
}

export const ProductCardImage: React.FC<ProductCardImageProps> = ({ product, onInfoClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);

  const handleImageError = () => {
    setImgSrc('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop');
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 group">
      {/* Skeleton / Blur placeholder while loading */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-200 animate-pulse z-10"
          />
        )}
      </AnimatePresence>

      <Image
        src={imgSrc}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        className={cn(
          "object-cover transition-all duration-700 group-hover:scale-110",
          !isLoaded ? "blur-xl" : "blur-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        priority={false}
      />

      {/* Modern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Info Button */}
      <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
        <Button
          variant="secondary"
          size="icon"
          onClick={onInfoClick}
          className="w-9 h-9 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border-none hover:bg-white active:scale-90"
        >
          <Info className="w-5 h-5 text-slate-800" />
        </Button>
      </div>
    </div>
  );
};

// Helper function for cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
