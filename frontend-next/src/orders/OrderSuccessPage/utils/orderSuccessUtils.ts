"use client";
// Order success utilities
import type { PaymentMethod, OrderDetails } from '../types';

export const formatOrderTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getPaymentMethodText = (method: PaymentMethod): string => {
  switch (method) {
    case 'cash':
      return 'Tiền mặt';
    case 'qr':
      return 'Quét mã QR';
    default:
      return 'Chưa xác định';
  }
};

// DEPRECATED: Không dùng localStorage nữa, load từ backend API
// Giữ lại để tương thích ngược (fallback)
export const loadLatestOrder = (): { order: OrderDetails; paymentMethod: PaymentMethod } | null => {
  // Không load từ localStorage nữa
  // Order Success Page sẽ load từ backend API qua useOrderSuccess hook
  return null;
};

