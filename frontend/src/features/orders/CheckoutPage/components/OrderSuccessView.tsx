import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '@features/orders/services/order.service';
import { SuccessIcon } from '@features/orders/OrderSuccessPage/components/SuccessIcon';
import { SuccessMessage } from '@features/orders/OrderSuccessPage/components/SuccessMessage';
import { OrderInfoCard } from '@features/orders/OrderSuccessPage/components/OrderInfoCard';
import { ActionButtons } from '@features/orders/OrderSuccessPage/components/ActionButtons';
import type { OrderDetails, PaymentMethod } from '@features/orders/OrderSuccessPage/types';
import type { Order } from '@features/orders/services/order.service';
import toast from 'react-hot-toast';

interface OrderSuccessViewProps {
  orderId: string;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  customerName?: string;
  table?: string;
  onNewOrder: () => void;
  onGoHome: () => void;
}

const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  orderId,
  orderNumber,
  paymentMethod,
  customerName,
  table,
  onNewOrder,
  onGoHome,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transform Order from API to OrderDetails format
  const transformOrderToDetails = (order: Order): OrderDetails => {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      timestamp: new Date(order.createdAt).getTime(),
      total: parseFloat(order.totalAmount),
      items: order.items.length,
      customerName: order.customerName || customerName || 'Khách hàng',
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

  // Store order creator and status for SuccessMessage
  const [orderCreator, setOrderCreator] = React.useState<'CUSTOMER' | 'STAFF' | undefined>();
  const [orderStatus, setOrderStatus] = React.useState<string | undefined>();

  // Load order details from backend API
  useEffect(() => {
    const loadOrderFromAPI = async () => {
      try {
        const order = await orderService.getById(orderId);
        const details = transformOrderToDetails(order);
        setOrderDetails(details);
        setOrderCreator(order.orderCreator as 'CUSTOMER' | 'STAFF');
        setOrderStatus(order.status);
        setIsLoading(false);
      } catch (error: any) {
        // Error loading order - toast notification shown
        toast.error('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
        setIsLoading(false);
      }
    };

    if (orderId) {
      loadOrderFromAPI();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mb-4"></div>
        <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col items-center justify-center overflow-hidden px-4 py-2">
      <div className="w-[80%] flex flex-col items-center justify-center space-y-2 flex-shrink-0">
        <SuccessIcon />
        <SuccessMessage orderCreator={orderCreator} orderStatus={orderStatus} />

        {orderDetails && (
          <div className="w-full flex-shrink-0">
            <OrderInfoCard 
              orderDetails={orderDetails}
              paymentMethod={paymentMethod}
            />
          </div>
        )}

        <div className="w-full flex-shrink-0">
          <ActionButtons 
            onNewOrder={onNewOrder}
            onGoHome={onGoHome}
            orderId={orderId}
            orderNumber={orderNumber}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessView;

