import { useEffect, useRef } from 'react';
import { subscribeToOrders } from '@lib/socket.service';
import type { Order } from '../services/order.service';

/**
 * Hook để subscribe orders updates qua Socket.io
 * Uses refs to prevent unnecessary re-subscriptions when callbacks change
 */
export function useSocketOrders(
  onOrderCreated?: (order: Order) => void,
  onOrderUpdated?: (order: Order) => void,
  onOrderStatusChanged?: (data: { orderId: string; status: string }) => void
) {
  // Use refs to store latest callbacks without causing re-subscriptions
  const onOrderCreatedRef = useRef(onOrderCreated);
  const onOrderUpdatedRef = useRef(onOrderUpdated);
  const onOrderStatusChangedRef = useRef(onOrderStatusChanged);

  // Update refs when callbacks change
  useEffect(() => {
    onOrderCreatedRef.current = onOrderCreated;
    onOrderUpdatedRef.current = onOrderUpdated;
    onOrderStatusChangedRef.current = onOrderStatusChanged;
  }, [onOrderCreated, onOrderUpdated, onOrderStatusChanged]);

  useEffect(() => {
    // Wrapper functions that use refs to get latest callbacks
    const wrappedOnOrderCreated = (order: Order) => {
      onOrderCreatedRef.current?.(order);
    };
    const wrappedOnOrderUpdated = (order: Order) => {
      onOrderUpdatedRef.current?.(order);
    };
    const wrappedOnOrderStatusChanged = (data: { orderId: string; status: string }) => {
      onOrderStatusChangedRef.current?.(data);
    };

    const cleanup = subscribeToOrders(
      wrappedOnOrderCreated,
      wrappedOnOrderUpdated,
      wrappedOnOrderStatusChanged
    );

    return cleanup;
    // Empty deps - only subscribe once, use refs for latest callbacks
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

