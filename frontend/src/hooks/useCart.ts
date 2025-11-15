import { useContext } from 'react';
import { CartContext } from '@context/CartContext';
import type { CartContextType } from '../types/cart';

/**
 * Custom hook to access cart context
 * @returns CartContextType - Cart context value
 * @throws Error if used outside of CartProvider
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};