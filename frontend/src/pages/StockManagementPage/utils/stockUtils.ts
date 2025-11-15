// Stock Management utilities
import { useProducts } from '../../../hooks/useProducts';
import type { Product } from '@/types/product';
import type { StockProduct } from '@services/stock.service.ts';
import type { StockFilter } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
};

export const useProductInfo = () => {
  const { products } = useProducts();

  const getProductInfo = (productId: string): Product | null => {
    return products.find((product) => String(product.id) === productId) || null;
  };

  const getCategories = (): string[] => {
    const categories = new Set<string>();
    products.forEach((product) => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories).sort();
  };

  return { getProductInfo, getCategories, products };
};

export const filterStocks = (
  stocks: StockProduct[],
  filter: StockFilter,
  categoryFilter: string,
  searchQuery: string,
  getProductInfo: (id: string) => Product | null
): StockProduct[] => {
  return stocks.filter((stock) => {
    if (!stock || !stock.productId) return false;

    if (filter === 'low_stock' && !(stock.currentStock <= stock.minStock && stock.currentStock > 0))
      return false;
    if (filter === 'out_of_stock' && stock.currentStock !== 0) return false;

    if (categoryFilter !== 'all') {
      const productInfo = getProductInfo(stock.productId);
      if (!productInfo || productInfo.category !== categoryFilter) return false;
    }

    if (searchQuery.trim()) {
      const productInfo = getProductInfo(stock.productId);
      const searchLower = searchQuery.toLowerCase();
      const matchesName = productInfo?.name.toLowerCase().includes(searchLower);
      const matchesId = stock.productId.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesId) return false;
    }

    return true;
  });
};

