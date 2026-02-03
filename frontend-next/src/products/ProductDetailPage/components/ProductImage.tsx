"use client";
import React from 'react';
import type { Product } from '@/types/product';

interface ProductImageProps {
  product: Product;
}

export const ProductImage: React.FC<ProductImageProps> = ({ product }) => {
  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg group">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            transition: 'transform 0.5s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) translateZ(0)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateZ(0)';
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/src/assets/img/gallery/default-food.png';
          }}
        />
      </div>
    </div>
  );
};

