/**
 * Order Display Service
 * Handles business logic for order display: transformation, filtering, status mapping
 * Follows architecture rules: Business logic in service layer
 */

import type { Order } from '@features/orders/services/order.service';
import type { OrderTracking } from '../types';

/**
 * Map backend order status to frontend display status
 * Business rule: Status mapping logic
 */
export function mapBackendStatusToDisplay(
  backendStatus: string,
  paymentStatus?: string,
  orderCreator?: string
): OrderTracking['status'] {
  const statusUpper = backendStatus?.toUpperCase() || '';

  switch (statusUpper) {
    case 'CREATING':
      return 'creating';
    case 'PENDING':
      // PENDING orders from CUSTOMER need verification
      return 'pending_verification';
    case 'HOLD':
      return 'hold';
    case 'CONFIRMED':
    case 'PREPARING':
    case 'READY':
      // If payment is successful, consider as completed
      if (paymentStatus?.toUpperCase() === 'SUCCESS') {
        return 'completed';
      }
      // If not paid yet, show in "Paid" section
      return 'paid';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      // Cancelled orders don't show in display
      return 'completed'; // Fallback
    default:
      return 'creating';
  }
}

/**
 * Transform backend Order to OrderTracking format
 * Business rule: Data transformation logic
 */
export function transformOrderToTracking(order: Order): OrderTracking {
  const isPaid = order.paymentStatus?.toUpperCase() === 'SUCCESS' || !!order.paidAt;
  const displayStatus =
    isPaid && order.status !== 'CREATING' && order.status !== 'PENDING'
      ? 'completed'
      : mapBackendStatusToDisplay(order.status, order.paymentStatus, order.orderCreator);

  return {
    id: order.id,
    orderId: order.orderNumber,
    createdBy: (order.orderCreator?.toLowerCase() as 'staff' | 'customer') || 'staff',
    createdByName: order.orderCreatorName || undefined,
    items:
      order.items?.map((item) => ({
        id: item.id,
        productId: parseInt(item.productId, 10),
        name: item.product?.name || 'Sản phẩm',
        image: item.product?.image || '',
        basePrice: parseFloat(item.price || '0'),
        quantity: item.quantity,
        totalPrice: parseFloat(item.subtotal || '0'),
        selectedSize: item.selectedSize ? { name: item.selectedSize, extraPrice: 0 } : undefined,
        selectedToppings:
          item.selectedToppings?.map((name: string) => ({
            name,
            extraPrice: 0,
          })) || [],
        note: item.note || undefined,
      })) || [],
    totalPrice: parseFloat(order.totalAmount || '0'),
    totalItems: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    status: displayStatus,
    backendStatus: order.status,
    customerInfo: {
      name: order.customerName || undefined,
      table: order.customerTable || undefined,
      phone: order.customerPhone || undefined,
    },
    paymentMethod: order.paymentMethod?.toLowerCase() as 'cash' | 'qr' | undefined,
    paymentStatus: order.paymentStatus?.toLowerCase() as 'success' | 'pending' | 'failed' | undefined,
    timestamp: new Date(order.createdAt).getTime(),
    lastUpdated: new Date(order.updatedAt || order.createdAt).getTime(),
    paidAt: order.paidAt ? new Date(order.paidAt).getTime() : undefined,
  };
}

/**
 * Filter valid CREATING orders
 * Business rule: Only show CREATING orders that have items
 * Empty CREATING orders should be filtered out (they are stale/abandoned)
 */
export function isValidCreatingOrder(order: Order): boolean {
  // For CREATING orders, only show if they have items
  // Empty CREATING orders are considered stale and should not be displayed
  if (order.status === 'CREATING') {
    // Must have items to be displayed
    return !!(order.items && order.items.length > 0);
  }
  // For other statuses, show all
  return true;
}

/**
 * Transform and filter orders from backend
 */
export function transformOrders(backendOrders: Order[]): OrderTracking[] {
  return backendOrders.filter(isValidCreatingOrder).map(transformOrderToTracking);
}
