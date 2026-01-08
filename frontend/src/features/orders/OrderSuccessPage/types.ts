// Types for OrderSuccessPage
export interface OrderDetails {
  id: string;
  orderNumber?: string; // Thêm orderNumber từ backend
  timestamp: number;
  total: number;
  items: number;
  customerName: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    size: string | null;
    toppings: string[];
    note: string | null;
  }>;
}

export interface LocationState {
  orderId?: string;
  paymentMethod?: 'cash' | 'qr';
  customerName?: string;
  table?: string;
}

export type PaymentMethod = 'cash' | 'qr' | null;

