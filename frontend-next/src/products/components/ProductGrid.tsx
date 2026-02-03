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
      staggerChildren: 0.03 // Nhanh hơn để tạo cảm giác snappy
    }
  }
};

const ProductGrid: React.FC<ProductGridProps> = memo(({ products, onProductClick, onQuickAdd }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isCustomerDisplay = pathname.startsWith('/customer');

  const handleProductClick = useCallback((product: Product) => {
    if (onProductClick) {
      onProductClick(product);
      return;
    }

    if (isCustomerDisplay) {
      router.push(`/customer/product/${product.id}`);
    } else {
      // Typically modals are used in POS, but routing is a fallback
      router.push(`/?product=${product.id}`);
    }
  }, [router, isCustomerDisplay, onProductClick]);

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="w-24 h-24 bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-slate-50">
          <PackageSearch className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">
          Hết món rồi ông chủ!
        </h3>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
          Thử tìm kiếm với từ khóa khác hoặc lọc theo danh mục
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8"
    >
      <AnimatePresence mode="popLayout" initial={false}>
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
