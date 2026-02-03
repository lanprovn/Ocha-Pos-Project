"use client";
// Types for CheckoutPage
export interface CustomerInfo {
  name: string;
  phone: string;
  table: string;
  notes: string;
}

export type PaymentMethod = 'cash' | 'qr';

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  'cash': 'Tiền mặt',
  'qr': 'Quét mã QR'
};

