// Product detail calculations
import type { Product } from '@/types/product';
import type { Size, Topping } from '@/types/product';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export const calculateTotalPrice = (
  product: Product | undefined,
  selectedSize: Size | undefined,
  selectedToppings: Topping[],
  quantity: number
): number => {
  if (!product) return 0;
  const base = product.price;
  const sizePrice = selectedSize?.extraPrice || 0;
  const toppingPrice = selectedToppings.reduce((sum, t) => sum + t.extraPrice, 0);
  return (base + sizePrice + toppingPrice) * quantity;
};

