// Order display hook
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { groupOrdersByStatus } from '../utils/orderDisplayUtils';
import { useSocketOrders } from '@hooks/useSocketOrders';
import { orderService } from '@services/order.service';
import type { OrderTracking, GroupedOrders } from '../types';
import type { Order } from '@services/order.service';

export const useOrderDisplay = () => {
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const completedSectionRef = useRef<HTMLDivElement | null>(null);
  const previousCompletedCountRef = useRef<number>(0);

  // Map backend status to frontend display status
  const mapStatus = useCallback((backendStatus: string, paymentStatus?: string): OrderTracking['status'] => {
    const statusUpper = backendStatus?.toUpperCase() || '';
    
    // Map backend statuses to frontend display statuses
    // Logic mới: Khi thanh toán xong thì coi như đã hoàn thành
    switch (statusUpper) {
      case 'CREATING':
        return 'creating';
      case 'PENDING':
      case 'CONFIRMED':
      case 'PREPARING':
      case 'READY':
        // Nếu đã thanh toán thành công, coi như đã hoàn thành
        if (paymentStatus?.toUpperCase() === 'SUCCESS') {
          return 'completed';
        }
        // Nếu chưa thanh toán, hiển thị ở section "Đã thanh toán" (tạm thời)
        return 'paid';
      case 'COMPLETED':
        return 'completed';
      default:
        // Fallback: nếu không match, thử lowercase trực tiếp
        const statusLower = backendStatus?.toLowerCase() || 'creating';
        if (['creating', 'paid', 'preparing', 'completed'].includes(statusLower)) {
          return statusLower as OrderTracking['status'];
        }
        // Default fallback
        return 'creating';
    }
  }, []);

  // Transform backend Order to OrderTracking format
  const transformOrder = useCallback((order: Order): OrderTracking => {
    // Nếu đã thanh toán thành công, tự động chuyển sang completed
    const isPaid = order.paymentStatus?.toUpperCase() === 'SUCCESS' || order.paidAt;
    const displayStatus = isPaid && order.status !== 'CREATING' 
      ? 'completed' 
      : mapStatus(order.status, order.paymentStatus);
    
    return {
      id: order.id,
      orderId: order.orderNumber,
      createdBy: (order.orderCreator?.toLowerCase() as 'staff' | 'customer') || 'staff',
      createdByName: order.orderCreatorName || undefined,
      items: order.items?.map((item) => ({
        id: item.productId,
        name: item.product?.name || 'Sản phẩm',
        quantity: item.quantity,
        price: parseFloat(item.price || 0),
        totalPrice: parseFloat(item.subtotal || 0),
        selectedSize: item.selectedSize ? { id: '', name: item.selectedSize, extraPrice: 0 } : undefined,
        selectedToppings:
          item.selectedToppings?.map((name: string, idx: number) => ({
            id: `topping-${idx}`,
            name,
            extraPrice: 0,
          })) || [],
        note: item.note || undefined,
      })) || [],
      totalPrice: parseFloat(order.totalAmount || 0),
      totalItems: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      status: displayStatus,
      backendStatus: order.status, // Lưu backend status gốc để check trong OrderCard
      customerInfo: {
        name: order.customerName || undefined,
        table: order.customerTable || undefined,
        phone: order.customerPhone || undefined,
      },
      paymentMethod: order.paymentMethod?.toLowerCase() as 'cash' | 'card' | 'qr' | undefined,
      paymentStatus: order.paymentStatus?.toLowerCase() as 'success' | 'pending' | 'failed' | undefined,
      timestamp: new Date(order.createdAt).getTime(),
      lastUpdated: new Date(order.updatedAt || order.createdAt).getTime(),
      paidAt: order.paidAt ? new Date(order.paidAt).getTime() : undefined,
    };
  }, [mapStatus]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load today's orders from backend API (bao gồm cả draft orders với status CREATING)
      const backendOrders = await orderService.getToday();
      
      // Transform to OrderTracking format
      // Lọc bỏ các draft orders không có items (cart rỗng)
      const transformedOrders: OrderTracking[] = backendOrders
        .filter(order => {
          // Nếu là draft order (CREATING) và không có items, không hiển thị
          if (order.status === 'CREATING' && (!order.items || order.items.length === 0)) {
            return false;
          }
          return true;
        })
        .map(transformOrder);
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders from backend:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [transformOrder]);

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

  // Callbacks for socket events (memoized để tránh re-subscribe)
  const handleOrderCreated = useCallback((order: Order) => {
    console.log('📦 Socket: order_created event received', order.id, order.orderNumber);
    // Order created - reload all orders để đảm bảo sync
    // Delay nhỏ để đảm bảo backend đã lưu xong
    setTimeout(() => {
      loadOrders();
    }, 300);
  }, [loadOrders]);

  const handleOrderUpdated = useCallback((order: Order) => {
    console.log('🔄 Socket: order_updated event received', order.id, order.status);
    // Order updated - update ngay lập tức
    setOrders(prevOrders => {
      const existingIndex = prevOrders.findIndex(o => o.id === order.id);
      
      // Nếu là draft order (CREATING) và không có items, xóa khỏi danh sách
      if (order.status === 'CREATING' && (!order.items || order.items.length === 0)) {
        if (existingIndex >= 0) {
          return prevOrders.filter(o => o.id !== order.id);
        }
        return prevOrders;
      }
      
      const transformed = transformOrder(order);
      
      if (existingIndex >= 0) {
        // Update existing order
        const updated = [...prevOrders];
        updated[existingIndex] = transformed;
        return updated;
      } else {
        // Add new order (chỉ thêm nếu không phải CREATING rỗng)
        return [transformed, ...prevOrders];
      }
    });
  }, [transformOrder]);

  const handleOrderStatusChanged = useCallback((data: { orderId: string; status: string }) => {
    console.log('📊 Socket: order_status_changed event received', data.orderId, data.status);
    // Order status changed - reload all orders để đảm bảo sync
    // Delay nhỏ để đảm bảo backend đã update xong
    setTimeout(() => {
      loadOrders();
    }, 300);
  }, [loadOrders]);

  // Listen to socket events for real-time updates
  useSocketOrders(
    handleOrderCreated,
    handleOrderUpdated,
    handleOrderStatusChanged
  );

  // Fallback: Polling mỗi 30 giây để đảm bảo sync (giảm tần suất để tránh race condition)
  // Điều này đảm bảo nếu socket events bị miss, vẫn có polling backup
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadOrders();
    }, 30000); // Poll mỗi 30 giây (giảm từ 5 giây để tránh conflict với socket updates)
    return () => clearInterval(pollInterval);
  }, [loadOrders]);
  
  // Listen to custom window events (fallback nếu socket không hoạt động)
  useEffect(() => {
    const handleOrderCompleted = (event: CustomEvent) => {
      console.log('📢 Custom event: orderCompleted', event.detail);
      // Reload orders khi nhận custom event
      setTimeout(() => {
        loadOrders();
      }, 500);
    };

    window.addEventListener('orderCompleted', handleOrderCompleted as EventListener);
    return () => {
      window.removeEventListener('orderCompleted', handleOrderCompleted as EventListener);
    };
  }, [loadOrders]);

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
      // Smooth scroll to completed section
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
  };
};

