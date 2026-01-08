// Order success hook
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@features/orders/hooks/useCart';
import { useOrderTracking } from '@features/orders/hooks/useOrderTracking';
import { orderService } from '@features/orders/services/order.service';
import toast from 'react-hot-toast';
import type { OrderDetails, LocationState, PaymentMethod } from '../types';
import type { OrderTracking } from '@/types/display';
import type { Order } from '@features/orders/services/order.service';

export const useOrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateOrderStatus } = useCart();
  const { updateOrderStatus: updateOrderTrackingStatus } = useOrderTracking();
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [orderCreator, setOrderCreator] = useState<'CUSTOMER' | 'STAFF' | undefined>();
  const [orderStatus, setOrderStatus] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Transform Order from API to OrderDetails format
  const transformOrderToDetails = (order: Order): OrderDetails => {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      timestamp: new Date(order.createdAt).getTime(),
      total: parseFloat(order.totalAmount),
      items: order.items.length,
      customerName: order.customerName || 'Khách hàng',
      products: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.subtotal),
        size: item.selectedSize || null,
        toppings: item.selectedToppings || [],
        note: item.note || null,
      })),
    };
  };

  // Get payment method from order
  const getPaymentMethodFromOrder = (order: Order): PaymentMethod => {
    const method = order.paymentMethod?.toLowerCase();
    if (method === 'cash') return 'cash';
    if (method === 'qr') return 'qr';
    return null;
  };

  // Load order details from backend API
  useEffect(() => {
    const loadOrderFromAPI = async () => {
      try {
        const state = location.state as LocationState | null;
        const orderId = state?.orderId;

        if (!orderId) {
          // Nếu không có orderId, thử load từ localStorage (fallback)
          // No orderId in location state - cannot load from API
          setIsLoading(false);
          return;
        }

        // Load order from backend API
        const order = await orderService.getById(orderId);
        
        // Transform to OrderDetails format
        const details = transformOrderToDetails(order);
        setOrderDetails(details);

        // Get payment method from order or location state
        const method = getPaymentMethodFromOrder(order) || state?.paymentMethod || null;
        setPaymentMethod(method);

        // Store order creator and status for SuccessMessage
        setOrderCreator(order.orderCreator as 'CUSTOMER' | 'STAFF');
        setOrderStatus(order.status);

        setIsLoading(false);
      } catch (error: any) {
        console.error('Error loading order from API:', error);
        toast.error('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
        setIsLoading(false);
      }
    };

    loadOrderFromAPI();
  }, [location.state]);

  // Update order tracking status to completed when page loads
  useEffect(() => {
    updateOrderStatus('completed');

    const state = location.state as LocationState | null;
    if (state?.orderId) {
      // Update order tracking status (nếu cần)
      // Không cần localStorage nữa vì đã dùng backend
      updateOrderTrackingStatus(
        state.orderId,
        'completed',
        state.orderId,
        state.paymentMethod || 'cash',
        'success'
      );
    }
  }, [updateOrderStatus, updateOrderTrackingStatus, location.state]);

  const handleNewOrder = () => {
    const isCustomerDisplay = location.pathname.startsWith('/customer');
    navigate(isCustomerDisplay ? '/customer' : '/');
  };

  const handleGoHome = () => {
    const isCustomerDisplay = location.pathname.startsWith('/customer');
    navigate(isCustomerDisplay ? '/customer' : '/');
  };

  return {
    orderDetails,
    paymentMethod,
    orderCreator,
    orderStatus,
    isLoading,
    handleNewOrder,
    handleGoHome
  };
};

