"use client";
import React, { memo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { PackageSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const ProductGrid: React.FC<ProductGridProps> = memo(({ products, onProductClick, onQuickAdd }) => {
  const navigate = useRouter();
  const location = usePathname();
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl shadow-slate-200 flex items-center justify-center mb-6 border border-slate-50">
          <PackageSearch className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
          Không tìm thấy món
        </h3>
        <p className="text-sm text-slate-400 max-w-xs font-medium uppercase tracking-widest text-[10px]">
          Vui lòng kiểm tra lại bộ lọc hoặc từ khóa tìm kiếm
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => handleProductClick(product)}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
