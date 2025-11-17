// Types for CheckoutPage
export interface CustomerInfo {
  name: string;
  phone: string;
  table: string;
  notes: string;
}

export type PaymentMethod = 'cash' | 'card' | 'qr';

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  'cash': 'Tiền mặt',
  'card': 'Thẻ ngân hàng',
  'qr': 'Quét mã QR'
};

