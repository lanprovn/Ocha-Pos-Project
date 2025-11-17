// Types for ProductDetailPage
import type { Size, Topping } from '../../types/product';

export interface ProductDetailState {
  selectedSize: Size | undefined;
  selectedToppings: Topping[];
  quantity: number;
  note: string;
}

export interface LocationState {
  orderId?: string;
  paymentMethod?: 'cash' | 'card' | 'qr';
  customerName?: string;
  table?: string;
}

