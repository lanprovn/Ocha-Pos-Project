import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '../../../services/order.service';
import { SuccessIcon } from '../../OrderSuccessPage/components/SuccessIcon';
import { SuccessMessage } from '../../OrderSuccessPage/components/SuccessMessage';
import { OrderInfoCard } from '../../OrderSuccessPage/components/OrderInfoCard';
import { ActionButtons } from '../../OrderSuccessPage/components/ActionButtons';
import type { OrderDetails, PaymentMethod } from '../../OrderSuccessPage/types';
import type { Order } from '../../../services/order.service';
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

  // Load order details from backend API
  useEffect(() => {
    const loadOrderFromAPI = async () => {
      try {
        const order = await orderService.getById(orderId);
        const details = transformOrderToDetails(order);
        setOrderDetails(details);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error loading order from API:', error);
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
    <div className="min-h-screen w-full bg-gray-50 py-8 px-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SuccessIcon />
        <SuccessMessage />

        {orderDetails && (
          <OrderInfoCard 
            orderDetails={orderDetails}
            paymentMethod={paymentMethod}
          />
        )}

        <ActionButtons 
          onNewOrder={onNewOrder}
          onGoHome={onGoHome}
          orderId={orderId}
          orderNumber={orderNumber}
        />
      </div>
    </div>
  );
};

export default OrderSuccessView;

