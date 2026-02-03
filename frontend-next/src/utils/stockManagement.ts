import type { StockProduct } from '@features/stock/services/stock.service';

export const STOCK_UNITS = [
  'cái',
  'kg',
  'lít',
  'gói',
  'hộp',
  'chai',
  'lon',
  'túi',
  'miếng',
  'phần',
] as const;

export type StockUnit = (typeof STOCK_UNITS)[number];

export const DEFAULT_STOCK_SETTINGS = {
  minStock: 5,
  maxStock: 100,
  unit: 'cái' as StockUnit,
};

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export const getStockStatus = (stock: Pick<StockProduct, 'currentStock' | 'minStock'>): StockStatus => {
  if (stock.currentStock === 0) return 'out_of_stock';
  if (stock.currentStock <= stock.minStock) return 'low_stock';
  return 'in_stock';
};

export const getStockStatusColor = (status: StockStatus): string => {
  switch (status) {
    case 'in_stock':
      return 'text-green-600';
    case 'low_stock':
      return 'text-yellow-600';
    case 'out_of_stock':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getStockStatusIcon = (status: StockStatus): string => {
  switch (status) {
    case 'in_stock':
      return '✅';
    case 'low_stock':
      return '⚠️';
    case 'out_of_stock':
      return '❌';
    default:
      return '❓';
  }
};