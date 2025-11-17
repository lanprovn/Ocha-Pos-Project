import type { Size, Topping } from './product';

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  image: string;
  basePrice: number;
  selectedSize?: Size;
  selectedToppings: Topping[];
  note?: string;
  quantity: number;
  totalPrice: number;
}

export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  updateOrderStatus: (status: 'creating' | 'confirmed' | 'paid' | 'completed', customerInfo?: { name?: string; table?: string }, paymentMethod?: 'cash' | 'card' | 'qr', paymentStatus?: 'success' | 'pending' | 'failed') => void;
  setOrderCreator: (creator: { type: 'staff' | 'customer'; name?: string } | null) => void;
}
