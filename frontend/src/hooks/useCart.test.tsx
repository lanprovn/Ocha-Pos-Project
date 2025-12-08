import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';
import { CartProvider } from '../context/CartContext';
import type { ReactNode } from 'react';

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../hooks/useDisplaySync', () => ({
  useDisplaySync: () => ({
    sendToDisplay: vi.fn(),
  }),
}));

vi.mock('../services/order.service', () => ({
  orderService: {
    createOrUpdateDraft: vi.fn().mockResolvedValue({ id: 'draft-1' }),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('useCart', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should throw error when used outside CartProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart must be used within a CartProvider');

    consoleSpy.mockRestore();
  });

  it('should provide cart context when used inside CartProvider', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const newItem = {
      productId: 1,
      name: 'Test Product',
      image: 'test.jpg',
      basePrice: 50000,
      selectedSize: undefined,
      selectedToppings: [],
      note: '',
      quantity: 1,
      totalPrice: 50000,
    };

    act(() => {
      result.current.addToCart(newItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Test Product');
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(50000);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item1 = {
      productId: 1,
      name: 'Product 1',
      image: 'test1.jpg',
      basePrice: 50000,
      selectedSize: undefined,
      selectedToppings: [],
      note: '',
      quantity: 1,
      totalPrice: 50000,
    };

    act(() => {
      result.current.addToCart(item1);
      const itemId = result.current.items[0].id;
      result.current.removeFromCart(itemId);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item = {
      productId: 1,
      name: 'Test Product',
      image: 'test.jpg',
      basePrice: 50000,
      selectedSize: undefined,
      selectedToppings: [],
      note: '',
      quantity: 1,
      totalPrice: 50000,
    };

    act(() => {
      result.current.addToCart(item);
      const itemId = result.current.items[0].id;
      result.current.updateQuantity(itemId, 3);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalPrice).toBe(150000); // 50000 * 3
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const item1 = {
      productId: 1,
      name: 'Product 1',
      image: 'test1.jpg',
      basePrice: 50000,
      selectedSize: undefined,
      selectedToppings: [],
      note: '',
      quantity: 1,
      totalPrice: 50000,
    };

    const item2 = {
      productId: 2,
      name: 'Product 2',
      image: 'test2.jpg',
      basePrice: 30000,
      selectedSize: undefined,
      selectedToppings: [],
      note: '',
      quantity: 2,
      totalPrice: 60000,
    };

    act(() => {
      result.current.addToCart(item1);
      result.current.addToCart(item2);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should calculate total correctly for multiple items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({
        productId: 1,
        name: 'Product 1',
        image: 'test1.jpg',
        basePrice: 50000,
        selectedSize: undefined,
        selectedToppings: [],
        note: '',
        quantity: 2,
        totalPrice: 100000,
      });

      result.current.addToCart({
        productId: 2,
        name: 'Product 2',
        image: 'test2.jpg',
        basePrice: 30000,
        selectedSize: undefined,
        selectedToppings: [],
        note: '',
        quantity: 1,
        totalPrice: 30000,
      });
    });

    expect(result.current.totalItems).toBe(3); // 2 + 1
    expect(result.current.totalPrice).toBe(130000); // 100000 + 30000
  });
});

