import React, { memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Product } from '../../../../types/product';
import ProductCard from './ProductCard';

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
    // If onProductClick callback is provided, use it (for modal)
    if (onProductClick) {
      onProductClick(product);
      return;
    }
    
    // Otherwise, navigate to product detail page
    if (isCustomerDisplay) {
      navigate(`/customer/product/${product.id}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  }, [navigate, isCustomerDisplay, onProductClick]);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Không có sản phẩm nào
        </h3>
        <p className="text-sm text-gray-500">
          Vui lòng chọn danh mục khác để xem thêm sản phẩm
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

