import React from 'react';
import type { Product } from '@/types/product';
import { formatPrice } from '@/utils/formatPrice';
import { Badge } from '@/components/ui/badge';

interface ProductCardInfoProps {
  product: Product;
}

/**
 * ProductCardInfo - Luxury Typography for product cards
 */
export const ProductCardInfo: React.FC<ProductCardInfoProps> = ({ product }) => {
  return (
    <div className="p-4 space-y-2 bg-white flex flex-col justify-between flex-1">
      <div>
        <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          {product.category || 'Specialty'}
        </p>
      </div>

      <div className="flex items-end justify-between pt-2">
        <div className="flex flex-col">
          {product.discount && product.discount > 0 ? (
            <>
              <span className="text-[10px] text-slate-400 line-through font-medium">
                {formatPrice(product.price)}
              </span>
              <span className="text-base font-black text-rose-500 tracking-tighter">
                {formatPrice(product.price * (1 - product.discount / 100))}
              </span>
            </>
          ) : (
            <span className="text-base font-black text-slate-900 tracking-tighter">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] h-5 px-1.5 uppercase tracking-tighter">
            {product.sizes.length} Options
          </Badge>
        )}
      </div>
    </div>
  );
};
