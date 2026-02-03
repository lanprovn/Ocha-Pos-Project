import React from 'react';
import type { Product } from '@/types/product';
import { useProductStock } from '@features/products/hooks/useProductStock';
import { Badge } from '@/components/ui/badge';
import { Flame, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ProductCardBadgesProps {
  product: Product;
}

/**
 * ProductCardBadges - High-end status badges for products
 */
export const ProductCardBadges: React.FC<ProductCardBadgesProps> = ({ product }) => {
  const { isInStock, isOutOfStock, isLowStock, getStockQuantity } = useProductStock();

  const productId = typeof product.id === 'number' ? product.id.toString() : product.id;
  const stockQuantity = getStockQuantity(productId);
  const outOfStock = isOutOfStock(productId);
  const lowStock = isLowStock(productId);
  const inStock = isInStock(productId);

  return (
    <div className="absolute inset-x-2 top-2 flex flex-col gap-1.5 pointer-events-none z-10">
      {/* Popular Badge */}
      {product.isPopular && (
        <Badge className="w-fit bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter">
          <Flame className="w-2.5 h-2.5 fill-current" /> Phổ biến
        </Badge>
      )}

      {/* Discount Badge */}
      {product.discount && product.discount > 0 && (
        <Badge className="w-fit bg-rose-500 hover:bg-rose-600 text-white border-none shadow-sm px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter">
          -{product.discount}% OFF
        </Badge>
      )}

      {/* Stock Availability Badge - Bottom Positioned inside this container but visually at bottom via absolute */}
      <div className="absolute top-[138px] left-0">
        {outOfStock ? (
          <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-none px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter gap-1">
            <XCircle className="w-2.5 h-2.5" /> Hết hàng
          </Badge>
        ) : lowStock ? (
          <Badge className="bg-amber-500/90 backdrop-blur-md text-white border-none px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> Còn {stockQuantity}
          </Badge>
        ) : inStock && stockQuantity > 0 ? (
          <Badge className="bg-emerald-500/90 backdrop-blur-md text-white border-none px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter gap-1">
            <CheckCircle className="w-2.5 h-2.5" /> Sẵn sàng
          </Badge>
        ) : null}
      </div>
    </div>
  );
};
