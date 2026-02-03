import React, { memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { PackageSearch } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = memo(({ products, onProductClick, onQuickAdd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCustomerDisplay = location.pathname.startsWith('/customer');

  const handleProductClick = useCallback((product: Product) => {
    if (onProductClick) {
      onProductClick(product);
      return;
    }

    if (isCustomerDisplay) {
      navigate(`/customer/product/${product.id}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  }, [navigate, isCustomerDisplay, onProductClick]);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-center mb-6 border border-slate-50">
          <PackageSearch className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
          Hết món rồi ông chủ ơi!
        </h3>
        <p className="text-sm text-slate-400 max-w-xs font-medium">
          Dường như danh mục này đang trống hoặc từ khóa tìm kiếm không khớp. Thử chọn danh mục khác nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => handleProductClick(product)}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
