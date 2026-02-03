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
  preservePrice?: boolean;
}

export interface ParkedOrder {
  id: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  parkedAt: number; // Timestamp
  label?: string; // Tên bàn hoặc tên khách
}

export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateCartItemNote: (id: string, note: string) => void;
  clearCart: () => void;
  setCartItems: (items: Omit<CartItem, 'id'>[]) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  updateOrderStatus: (status: 'creating' | 'confirmed' | 'paid' | 'completed', customerInfo?: { name?: string; table?: string }, paymentMethod?: 'cash' | 'card' | 'qr', paymentStatus?: 'success' | 'pending' | 'failed') => void;
  setOrderCreator: (creator: { type: 'staff' | 'customer'; name?: string } | null) => void;
  orderCreator: { type: 'staff' | 'customer'; name?: string } | null;

  // Parked Orders Features
  parkedOrders: ParkedOrder[];
  parkOrder: (label?: string) => void;
  unparkOrder: (orderId: string) => void;
  deleteParkedOrder: (orderId: string) => void;
}
