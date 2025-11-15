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
        <div className="text-6xl mb-6">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-3">
          Không có sản phẩm nào
        </h3>
        <p className="text-base text-gray-500">
          Vui lòng chọn danh mục khác để xem thêm sản phẩm
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in-up"
          style={{ 
            animationDelay: `${index * 50}ms`,
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          }}
        >
          <ProductCard
            product={product}
            onClick={() => handleProductClick(product)}
            onQuickAdd={onQuickAdd}
          />
        </div>
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;

