"use client";
// Product detail hook
import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useProducts } from '@features/products/hooks/useProducts';
import { useCart } from '@features/orders/hooks/useCart';
import { calculateTotalPrice } from '../utils/productCalculations';
import type { Size, Topping } from '@/types/product';
import type { ProductDetailState } from '../types';
import { ROUTES } from '@constants';

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const location = usePathname();
  const isCustomerDisplay = location.pathname.startsWith(ROUTES.CUSTOMER);
  const { products } = useProducts();
  const { addToCart } = useCart();

  const [state, setState] = useState<ProductDetailState>({
    selectedSize: undefined,
    selectedToppings: [],
    quantity: 1,
    note: ''
  });

  const product = products.find(p => p.id === parseInt(id || '0'));

  // Initialize with first size if available
  useEffect(() => {
    const firstSize = product?.sizes?.[0];
    if (firstSize && !state.selectedSize) {
      setState((prev) => ({ ...prev, selectedSize: firstSize }));
    }
  }, [product?.sizes, state.selectedSize]);

  const setSelectedSize = (size: Size | undefined) => {
    setState(prev => ({ ...prev, selectedSize: size }));
  };

  const setSelectedToppings = (toppings: Topping[]) => {
    setState(prev => ({ ...prev, selectedToppings: toppings }));
  };

  const setQuantity = (quantity: number) => {
    setState(prev => ({ ...prev, quantity }));
  };

  const setNote = (note: string) => {
    setState(prev => ({ ...prev, note }));
  };

  const handleToppingToggle = (topping: Topping) => {
    setState(prev => {
      const isSelected = prev.selectedToppings.some(t => t.name === topping.name);
      if (isSelected) {
        return {
          ...prev,
          selectedToppings: prev.selectedToppings.filter(t => t.name !== topping.name)
        };
      } else {
        return {
          ...prev,
          selectedToppings: [...prev.selectedToppings, topping]
        };
      }
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    const totalPrice = calculateTotalPrice(
      product,
      state.selectedSize,
      state.selectedToppings,
      state.quantity
    );

    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      selectedSize: state.selectedSize,
      selectedToppings: state.selectedToppings,
      note: state.note,
      quantity: state.quantity,
      totalPrice,
    });

    // Reset form
    setState({
      selectedSize: product.sizes?.[0] || undefined,
      selectedToppings: [],
      quantity: 1,
      note: ''
    });
  };

  return {
    product,
    isCustomerDisplay,
    navigate,
    state,
    setSelectedSize,
    setSelectedToppings,
    setQuantity,
    setNote,
    handleToppingToggle,
    handleAddToCart
  };
};

