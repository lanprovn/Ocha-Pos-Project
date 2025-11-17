import { useEffect, useCallback, useRef } from 'react';
import type { CartItem } from '../types/cart';
import type { OrderTracking, OrderTrackingMessage } from '../types/display';
import { STORAGE_KEYS } from '@constants';

const ORDER_TRACKING_CHANNEL_NAME = 'ocha_order_tracking';

/**
 * Hook để track và đồng bộ orders real-time
 * Phân biệt orders từ nhân viên và khách hàng
 */
export function useOrderTracking() {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel
  if (!channelRef.current) {
    try {
      channelRef.current = new BroadcastChannel(ORDER_TRACKING_CHANNEL_NAME);
    } catch (error) {
      console.warn('Failed to create OrderTracking BroadcastChannel:', error);
      channelRef.current = null;
    }
  }

  const channel = channelRef.current;

  /**
   * Gửi order update đến tracking system
   */
  const sendOrderUpdate = useCallback((
    items: CartItem[],
    totalPrice: number,
    totalItems: number,
    createdBy: 'staff' | 'customer',
    createdByName?: string,
    customerInfo?: { name?: string; table?: string; phone?: string },
    orderId?: string
  ) => {
    try {
      // Chỉ track orders đang được tạo (có items)
      if (items.length === 0) {
        return;
      }

      const orderIdToUse = orderId || `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const orderTracking: OrderTracking = {
        id: orderIdToUse,
        createdBy,
        createdByName,
        items,
        totalPrice,
        totalItems,
        status: 'creating',
        customerInfo,
        timestamp: Date.now(),
        lastUpdated: Date.now()
      };

      const message: OrderTrackingMessage = {
        type: 'order_updated',
        data: orderTracking
      };

      // Gửi qua BroadcastChannel - chỉ khi channel đã mở
      if (channel && channel.readyState === 'open') {
        try {
          channel.postMessage(message);
        } catch (error) {
          console.warn('Failed to post order tracking message:', error);
        }
      }

      // Lưu vào localStorage
      const stored = localStorage.getItem(STORAGE_KEYS.ORDER_TRACKING);
      let orders: OrderTracking[] = stored ? JSON.parse(stored) : [];
      
      // Tìm order cũ cùng ID hoặc cùng createdBy và đang được tạo
      // Mỗi session (staff hoặc customer) chỉ có 1 order đang được tạo
      const existingIndex = orders.findIndex(
        o => o.id === orderIdToUse || 
        (o.createdBy === createdBy && o.status === 'creating')
      );

      if (existingIndex >= 0) {
        // Update existing order
        orders[existingIndex] = orderTracking;
      } else {
        // Add new order
        orders.push(orderTracking);
      }

      // Giữ lại tất cả orders (không filter theo status)
      
      localStorage.setItem(STORAGE_KEYS.ORDER_TRACKING, JSON.stringify(orders));

      // Trigger custom event
      const customEvent = new CustomEvent('orderTrackingUpdate', { 
        detail: orders 
      });
      window.dispatchEvent(customEvent);
    } catch (error) {
      console.warn('Failed to send order tracking update:', error);
    }
  }, [channel]);

  /**
   * Cập nhật status của order (paid, preparing, completed)
   */
  const updateOrderStatus = useCallback((
    orderId: string,
    status: OrderTracking['status'],
    orderSystemId?: string,
    paymentMethod?: 'cash' | 'card' | 'qr',
    paymentStatus?: 'success' | 'pending' | 'failed',
    customerInfo?: { name?: string; table?: string; phone?: string }
  ) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDER_TRACKING);
      if (stored) {
        const orders: OrderTracking[] = JSON.parse(stored);
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex >= 0) {
          const order = orders[orderIndex];
          orders[orderIndex] = {
            ...order,
            status,
            orderId: orderSystemId || order.orderId,
            paymentMethod: paymentMethod || order.paymentMethod,
            paymentStatus: paymentStatus || order.paymentStatus,
            customerInfo: customerInfo || order.customerInfo,
            lastUpdated: Date.now(),
            paidAt: status === 'paid' ? Date.now() : order.paidAt
          };

          // Nếu completed, giữ lại order trong 30 giây rồi xóa
          if (status === 'completed') {
            setTimeout(() => {
              const storedAfter = localStorage.getItem(STORAGE_KEYS.ORDER_TRACKING);
              if (storedAfter) {
                const ordersAfter: OrderTracking[] = JSON.parse(storedAfter);
                const filtered = ordersAfter.filter(o => o.id !== orderId);
                localStorage.setItem(STORAGE_KEYS.ORDER_TRACKING, JSON.stringify(filtered));
                const customEvent = new CustomEvent('orderTrackingUpdate', { 
                  detail: filtered 
                });
                window.dispatchEvent(customEvent);
              }
            }, 30000); // 30 giây
          }

          localStorage.setItem(STORAGE_KEYS.ORDER_TRACKING, JSON.stringify(orders));

          // Gửi qua BroadcastChannel
          const message: OrderTrackingMessage = {
            type: 'order_updated',
            data: orders[orderIndex]
          };
          
          if (channel && channel.readyState === 'open') {
            try {
              channel.postMessage(message);
            } catch (error) {
              console.warn('Failed to post order status update:', error);
            }
          }

          // Trigger custom event
          const customEvent = new CustomEvent('orderTrackingUpdate', { 
            detail: orders 
          });
          window.dispatchEvent(customEvent);
        }
      }
    } catch (error) {
      console.warn('Failed to update order status:', error);
    }
  }, [channel]);

  /**
   * Xóa order khỏi tracking (khi completed hoặc cancelled)
   */
  const removeOrder = useCallback((orderId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDER_TRACKING);
      if (stored) {
        const orders: OrderTracking[] = JSON.parse(stored);
        const filtered = orders.filter(o => o.id !== orderId);
        localStorage.setItem(STORAGE_KEYS.ORDER_TRACKING, JSON.stringify(filtered));

        // Trigger custom event
        const customEvent = new CustomEvent('orderTrackingUpdate', { 
          detail: filtered 
        });
        window.dispatchEvent(customEvent);
      }
    } catch (error) {
      console.warn('Failed to remove order:', error);
    }
  }, []);

  /**
   * Subscribe to order tracking updates
   */
  const subscribeToOrders = useCallback((callback: (orders: OrderTracking[]) => void) => {
    let lastOrdersHash = '';

    const handleMessage = (event: MessageEvent<OrderTrackingMessage>) => {
      if (event.data.type === 'order_updated' || event.data.type === 'order_removed') {
        loadOrders();
      }
    };

    const loadOrders = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ORDER_TRACKING);
        if (stored) {
          const orders: OrderTracking[] = JSON.parse(stored);
          const ordersHash = JSON.stringify(orders);
          
          if (ordersHash !== lastOrdersHash) {
            lastOrdersHash = ordersHash;
            callback(orders);
          }
        } else {
          callback([]);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        callback([]);
      }
    };

    // Listen to BroadcastChannel
    if (channel) {
      channel.addEventListener('message', handleMessage);
    }

    // Listen to storage events
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.ORDER_TRACKING) {
        loadOrders();
      }
    };

    // Listen to custom events
    const handleCustomEvent = (event: CustomEvent) => {
      const orders = event.detail as OrderTracking[];
      callback(orders);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('orderTrackingUpdate', handleCustomEvent as EventListener);

    // Load initial data
    loadOrders();

    // Polling for updates
    const intervalId = setInterval(loadOrders, 100);

    // Cleanup
    return () => {
      if (channel) {
        channel.removeEventListener('message', handleMessage);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('orderTrackingUpdate', handleCustomEvent as EventListener);
      clearInterval(intervalId);
    };
  }, [channel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (channelRef.current) {
          channelRef.current.close();
        }
      } catch (error) {
        console.warn('Failed to close order tracking channel:', error);
      }
    };
  }, []);

  return {
    sendOrderUpdate,
    removeOrder,
    updateOrderStatus,
    subscribeToOrders
  };
}

