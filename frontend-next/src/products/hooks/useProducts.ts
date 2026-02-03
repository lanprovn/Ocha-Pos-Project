"use client";
import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import type { ProductContextType } from '@/types/product';

/**
 * Custom hook to access product context
 * @returns ProductContextType - Product context value
 * @throws Error if used outside of ProductProvider
 */
export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};