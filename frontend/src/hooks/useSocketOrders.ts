import { useEffect } from 'react';
import { subscribeToOrders } from '@services/socket.service';
import type { Order } from '@services/order.service';

/**
 * Hook để subscribe orders updates qua Socket.io
 */
export function useSocketOrders(
  onOrderCreated?: (order: Order) => void,
  onOrderUpdated?: (order: Order) => void,
  onOrderStatusChanged?: (data: { orderId: string; status: string }) => void
) {
  useEffect(() => {
    const cleanup = subscribeToOrders(
      onOrderCreated,
      onOrderUpdated,
      onOrderStatusChanged
    );

    return cleanup;
  }, [onOrderCreated, onOrderUpdated, onOrderStatusChanged]);
}

