// Checkout utilities
import type { CustomerInfo, PaymentMethod } from '../types';
import type { CartItem } from '../../../types/cart';
import type { Topping } from '../../../types/product';

export const validatePhone = (phone: string): boolean => {
  // Vietnamese phone number format: 10-11 digits, may start with 0 or +84
  const phoneRegex = /^(0|\+84)[1-9]\d{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const generateOrderId = (): string => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// DEPRECATED: Không lưu vào localStorage nữa
// Backend tự động tính daily sales từ orders trong database
// Frontend chỉ cần gọi API: GET /api/dashboard/daily-sales?date=YYYY-MM-DD
export const saveOrderToDailySales = (
  orderId: string,
  totalPrice: number,
  items: CartItem[],
  customerInfo: CustomerInfo,
  paymentMethod: PaymentMethod
): void => {
  // Không làm gì cả - backend tự động tính daily sales từ orders
  // Không cần lưu vào localStorage nữa
  console.log('Order saved to backend, daily sales will be calculated automatically');
};

