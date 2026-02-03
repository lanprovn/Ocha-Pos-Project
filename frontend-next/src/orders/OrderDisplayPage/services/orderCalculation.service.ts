"use client";
/**
 * Order Calculation Service
 * Handles all order price calculations: subtotal, VAT, discount, total
 * Business rule: Centralized calculation logic
 * 
 * IMPORTANT: Backend totalAmount = sum of all item.subtotal
 * Frontend applies discount and VAT to item subtotals before sending to backend
 * So backend totalAmount already includes VAT and discount
 */

import type { OrderTracking } from '../types';

export interface OrderTotals {
  subtotal: number; // Tạm tính (before VAT, after discount if any)
  vatAmount: number; // VAT amount (10% of subtotal)
  total: number; // Tổng cộng (subtotal + VAT)
}

/**
 * Calculate order totals from backend totalAmount
 * Business rule: Backend totalAmount is the source of truth
 * It already includes VAT and discount (applied to item subtotals)
 * 
 * Formula: totalAmount = subtotal + VAT = subtotal * 1.1
 * So: subtotal = totalAmount / 1.1
 */
export function calculateOrderTotals(order: OrderTracking): OrderTotals {
  // Use backend totalPrice as source of truth
  // It already includes VAT and any discount adjustments
  const total = order.totalPrice;
  
  // Reverse calculate subtotal and VAT
  // total = subtotal * 1.1 (VAT is 10%)
  const subtotal = total / 1.1;
  const vatAmount = total - subtotal;

  return {
    subtotal: Math.round(subtotal),
    vatAmount: Math.round(vatAmount),
    total: Math.round(total),
  };
}

/**
 * Calculate totals using backend totalAmount
 * Fallback method when items might not be accurate
 */
export function calculateOrderTotalsFromTotal(order: OrderTracking): OrderTotals {
  const total = order.totalPrice;
  const subtotal = total / 1.1;
  const vatAmount = total - subtotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
