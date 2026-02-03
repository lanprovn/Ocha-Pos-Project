"use client";
import { useState, useEffect, useMemo } from 'react';
import stockService from '@features/stock/services/stock.service';
import type { StockProduct } from '@features/stock/services/stock.service';

/**
 * Hook để load và map stock information với products
 */
export const useProductStock = () => {
  const [stocks, setStocks] = useState<StockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stockData = await stockService.getProductStocks();
        setStocks(stockData);
      } catch (error) {
        console.error('Error loading product stocks:', error);
        setStocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStocks();
  }, []);

  // Create a map for quick lookup: productId -> stock
  const stockMap = useMemo(() => {
    const map = new Map<string, StockProduct>();
    stocks.forEach((stock) => {
      map.set(stock.productId, stock);
    });
    return map;
  }, [stocks]);

  /**
   * Get stock for a product by productId
   */
  const getStock = (productId: string | number): StockProduct | null => {
    const id = typeof productId === 'number' ? productId.toString() : productId;
    return stockMap.get(id) || null;
  };

  /**
   * Check if product is in stock
   */
  const isInStock = (productId: string | number): boolean => {
    const stock = getStock(productId);
    if (!stock) return true; // Nếu không có stock record, coi như còn hàng
    return stock.currentStock > 0 && stock.isActive;
  };

  /**
   * Get stock quantity for a product
   */
  const getStockQuantity = (productId: string | number): number => {
    const stock = getStock(productId);
    return stock?.currentStock || 0;
  };

  /**
   * Check if product is low stock
   */
  const isLowStock = (productId: string | number): boolean => {
    const stock = getStock(productId);
    if (!stock) return false;
    return stock.currentStock > 0 && stock.currentStock <= stock.minStock;
  };

  /**
   * Check if product is out of stock
   */
  const isOutOfStock = (productId: string | number): boolean => {
    const stock = getStock(productId);
    if (!stock) return false;
    return stock.currentStock === 0 || !stock.isActive;
  };

  return {
    stocks,
    isLoading,
    stockMap,
    getStock,
    isInStock,
    getStockQuantity,
    isLowStock,
    isOutOfStock,
  };
};

