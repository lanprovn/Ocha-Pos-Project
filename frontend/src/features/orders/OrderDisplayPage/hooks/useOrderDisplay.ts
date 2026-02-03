/**
 * Order Display Hook
 * Manages order state and real-time synchronization via Socket.io
 * Follows architecture rules: Hook encapsulates state and socket listeners
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { groupOrdersByStatus } from '../utils/orderDisplayUtils';
import { useSocketOrders } from '@features/orders/hooks/useSocketOrders';
import { orderService } from '@features/orders/services/order.service';
import { transformOrders, transformOrderToTracking, mapBackendStatusToDisplay } from '../services/orderDisplay.service';
import type { OrderTracking, GroupedOrders } from '../types';
import type { Order } from '@features/orders/services/order.service';

export const useOrderDisplay = () => {
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const completedSectionRef = useRef<HTMLDivElement | null>(null);
  const previousCompletedCountRef = useRef<number>(0);

  /**
   * Load orders from backend API
   * Called on mount and as fallback
   */
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const backendOrders = await orderService.getToday();
      const transformedOrders = transformOrders(backendOrders);
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Don't clear orders on error to avoid losing current state
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Handle order created event from Socket.io
   * Optimistic update: Add order immediately to state
   */
  const handleOrderCreated = useCallback(
    (order: Order) => {
      setOrders((prevOrders) => {
        const existingIndex = prevOrders.findIndex((o) => o.id === order.id);

        if (existingIndex >= 0) {
          // Order exists, update it
          const updated = [...prevOrders];
          updated[existingIndex] = transformOrderToTracking(order);
          return updated;
        } else {
          // New order, add to beginning
          // Skip empty CREATING orders
          if (order.status === 'CREATING' && (!order.items || order.items.length === 0)) {
            return prevOrders;
          }
          const transformed = transformOrderToTracking(order);
          return [transformed, ...prevOrders];
        }
      });
    },
    []
  );

  /**
   * Handle order updated event from Socket.io
   * Update order in state immediately
   */
  const handleOrderUpdated = useCallback((order: Order) => {
    setOrders((prevOrders) => {
      const existingIndex = prevOrders.findIndex((o) => o.id === order.id);

      // If CREATING order becomes empty, remove it
      if (order.status === 'CREATING' && (!order.items || order.items.length === 0)) {
        if (existingIndex >= 0) {
          return prevOrders.filter((o) => o.id !== order.id);
        }
        return prevOrders;
      }

      const transformed = transformOrderToTracking(order);

      if (existingIndex >= 0) {
        // Update existing order
        const updated = [...prevOrders];
        updated[existingIndex] = transformed;
        return updated;
      } else {
        // Add new order
        return [transformed, ...prevOrders];
      }
    });
  }, []);

  /**
   * Handle order status changed event from Socket.io
   * Update only status field to avoid full reload
   */
  const handleOrderStatusChanged = useCallback((data: { orderId: string; status: string }) => {
    setOrders((prevOrders) => {
      const existingIndex = prevOrders.findIndex((o) => o.id === data.orderId);

      if (existingIndex >= 0) {
        const updated = [...prevOrders];
        const order = updated[existingIndex];

        // Map backend status to display status
        const newStatus = mapBackendStatusToDisplay(
          data.status,
          order.paymentStatus,
          order.createdBy === 'staff' ? 'STAFF' : 'CUSTOMER'
        );

        updated[existingIndex] = {
          ...order,
          status: newStatus,
          backendStatus: data.status,
          lastUpdated: Date.now(),
        };

        return updated;
      }

      return prevOrders;
    });
  }, []);

  /**
   * Handle draft orders deleted event from Socket.io
   * Remove deleted draft orders from state
   */
  const handleDraftOrdersDeleted = useCallback(
    (data: {
      orderIds: string[];
      orderCreator: 'STAFF' | 'CUSTOMER';
      orderCreatorName: string | null;
    }) => {
      setOrders((prevOrders) => {
        return prevOrders.filter((order) => !data.orderIds.includes(order.id));
      });
    },
    []
  );

  /**
   * Handle manual status update from OrderCard
   * We rely on Socket.io for the actual update, this is just a backup
   */
  const handleManualStatusUpdate = useCallback((orderId: string, newStatus: string) => {
    // Optimistic status update for instant UI feedback
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, backendStatus: newStatus, lastUpdated: Date.now() } : o
    ));

    // Set a safety timeout as fallback if socket fails
    const timeoutId = setTimeout(() => {
      loadOrders();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [loadOrders]);

  // Subscribe to Socket.io events for real-time updates
  useSocketOrders(
    handleOrderCreated,
    handleOrderUpdated,
    handleOrderStatusChanged,
    handleDraftOrdersDeleted
  );

  // Group orders by status
  const groupedOrders = useMemo<GroupedOrders>(() => {
    return groupOrdersByStatus(orders);
  }, [orders]);

  // Auto-scroll to completed section when new order is completed
  useEffect(() => {
    const currentCompletedCount = groupedOrders.completed.length;
    if (
      currentCompletedCount > previousCompletedCountRef.current &&
      previousCompletedCountRef.current > 0 &&
      completedSectionRef.current
    ) {
      setTimeout(() => {
        completedSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    }
    previousCompletedCountRef.current = currentCompletedCount;
  }, [groupedOrders.completed.length]);

  return {
    orders,
    groupedOrders,
    currentTime,
    isLoading,
    completedSectionRef,
    handleManualStatusUpdate,
  };
};
