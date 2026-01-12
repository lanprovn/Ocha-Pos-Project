// Customer Checkout hook - Tách riêng để tránh conflict với staff checkout
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '@features/orders/hooks/useCart';
import { useProducts } from '@features/products/hooks/useProducts';
import { validatePhone } from '../utils/checkoutUtils';
import { orderService } from '@features/orders/services/order.service';
import qrService from '@features/orders/services/qr.service';
import { subscribeToCustomerDiscount } from '@lib/socket.service';
import type { CustomerInfo, PaymentMethod } from '../types';
import type { QRPaymentData } from '@features/orders/components/QRPaymentModal';

export const useCustomerCheckout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load table number from localStorage or location state
  const savedTableNumber = localStorage.getItem('customer_table_number');
  const locationState = location.state as { 
    tableNumber?: string; 
  } | null;
  const initialTableNumber = locationState?.tableNumber || savedTableNumber || '';
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    table: initialTableNumber,
    notes: ''
  });
  
  const [discountRate, setDiscountRate] = useState<number>(0);
  
  // Save discountRate to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('checkout_discount_rate', discountRate.toString());
    window.dispatchEvent(new CustomEvent('discountRateChanged'));
  }, [discountRate]);

  // Listen to real-time customer discount updates via Socket.io
  useEffect(() => {
    const cleanup = subscribeToCustomerDiscount((data) => {
      const normalizePhone = (phone: string) => phone.trim().replace(/[\s\-\(\)]/g, '');
      const currentPhone = normalizePhone(customerInfo.phone);
      const eventPhone = normalizePhone(data.phone);

      if (currentPhone && eventPhone && currentPhone === eventPhone) {
        console.log('📡 Real-time discount update received (Customer):', {
          phone: data.phone,
          membershipLevel: data.customer.membershipLevel,
          discountRate: data.discountRate,
        });
        
        setDiscountRate(data.discountRate);
        
        if (data.customer.name) {
          setCustomerInfo(prev => ({
            ...prev,
            name: data.customer.name,
          }));
        }
      }
    });

    return cleanup;
  }, [customerInfo.phone, customerInfo.name]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr'); // Customer default to QR
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPaymentData, setQrPaymentData] = useState<QRPaymentData | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: string;
    orderNumber: string;
    paymentMethod: PaymentMethod;
    customerName?: string;
    table?: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleDiscountRateChange = (rate: number) => {
    setDiscountRate(rate);
  };

  const handleCompleteOrder = async (): Promise<void> => {
    if (!validatePhone(customerInfo.phone)) {
      toast.error('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10-11 chữ số.');
      return;
    }

    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const subtotal = totalPrice;
      const discountAmount = discountRate > 0 ? subtotal * (discountRate / 100) : 0;
      const priceAfterDiscount = subtotal - discountAmount;
      const vat = priceAfterDiscount * 0.1;
      const finalTotal = priceAfterDiscount + vat;

      const orderItems = items.map(item => {
        let itemPrice = item.basePrice;
        if (item.selectedSize?.extraPrice) {
          itemPrice += item.selectedSize.extraPrice;
        }
        if (item.selectedToppings && item.selectedToppings.length > 0) {
          const toppingsExtra = item.selectedToppings.reduce((sum, topping) => sum + (topping.extraPrice || 0), 0);
          itemPrice += toppingsExtra;
        }

        return {
          productId: item.productId.toString(),
          quantity: item.quantity,
          price: itemPrice,
          subtotal: item.totalPrice,
          selectedSize: item.selectedSize?.name || null,
          selectedToppings: item.selectedToppings?.map(t => t.name) || [],
          note: item.note || null,
        };
      });

      const orderItemsWithDiscountAndVAT = [...orderItems];
      if (orderItemsWithDiscountAndVAT.length > 0) {
        const currentTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const totalToAdd = finalTotal - currentTotal;
        const distributionFactor = totalToAdd / currentTotal;
        orderItemsWithDiscountAndVAT.forEach((item, index) => {
          const adjustment = item.subtotal * distributionFactor;
          orderItemsWithDiscountAndVAT[index] = {
            ...item,
            subtotal: item.subtotal + adjustment,
          };
        });
      }

      // CUSTOMER order creation - separate from staff
      const orderData = await orderService.create({
        customerName: customerInfo.name || null,
        customerPhone: customerInfo.phone || null,
        customerTable: customerInfo.table || null,
        notes: customerInfo.notes || null,
        paymentMethod: paymentMethod.toUpperCase() as 'CASH' | 'QR',
        paymentStatus: paymentMethod === 'cash' ? 'SUCCESS' : 'PENDING',
        orderCreator: 'CUSTOMER', // Fixed for customer
        orderCreatorName: 'Khách Hàng',
        items: orderItemsWithDiscountAndVAT,
      });

      if (paymentMethod === 'qr') {
        try {
          const qrResponse = await qrService.generateQR(orderData.id);
          setQrPaymentData(qrResponse);
          setShowQRModal(true);
          setIsProcessing(false);
          toast.success('Mã QR đã được tạo. Vui lòng quét mã để thanh toán.', {
            duration: 5000,
            icon: '📱',
          });
          return;
        } catch (qrError: any) {
          console.error('QR generation error:', qrError);
          toast.error(qrError?.message || 'Không thể tạo mã QR. Vui lòng thử lại.');
          setIsProcessing(false);
          return;
        }
      }

      // CUSTOMER cash payment: Keep PENDING status (wait for staff verification)
      toast.success(`Đơn hàng ${orderData.orderNumber} đã được tạo thành công!`, {
        duration: 3000,
        icon: '✅'
      });

      clearCart();
      setOrderSuccessData({
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
        paymentMethod,
        customerName: customerInfo.name,
        table: customerInfo.table,
      });
    } catch (error: any) {
      console.error('Order creation error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async (): Promise<void> => {
    if (!qrPaymentData) return;
    
    setIsVerifyingPayment(true);
    
    try {
      const verificationResult = await qrService.verifyPayment(qrPaymentData.orderId);
      
      if (verificationResult.success) {
        toast.success('Thanh toán thành công!', { icon: '✅' });
        
        // Update order payment status
        await orderService.updateStatus(qrPaymentData.orderId, {
          paymentStatus: 'SUCCESS',
        });
        
        // CUSTOMER QR payment: Keep PENDING status (wait for staff verification)
        
        clearCart();
        setShowQRModal(false);
        setQrPaymentData(null);
        
        setOrderSuccessData({
          orderId: qrPaymentData.orderId,
          orderNumber: qrPaymentData.orderNumber,
          paymentMethod: 'qr',
          customerName: customerInfo.name,
          table: customerInfo.table,
        });
      } else {
        toast.error('Thanh toán chưa được xác nhận. Vui lòng thử lại.', { icon: '❌' });
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error(error?.message || 'Không thể xác minh thanh toán. Vui lòng thử lại.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setQrPaymentData(null);
  };

  const handleNewOrder = () => {
    setOrderSuccessData(null);
    setCustomerInfo({
      name: '',
      phone: '',
      table: '',
      notes: '',
    });
    setDiscountRate(0);
    navigate('/customer');
  };

  const handleGoHome = () => {
    navigate('/customer');
  };

  return {
    items,
    totalPrice,
    discountRate,
    customerInfo,
    paymentMethod,
    isProcessing,
    showQRModal,
    qrPaymentData,
    isVerifyingPayment,
    orderSuccessData,
    handleInputChange,
    handlePaymentMethodChange,
    handleCompleteOrder,
    handleVerifyPayment,
    handleCloseQRModal,
    handleNewOrder,
    handleGoHome,
    handleDiscountRateChange,
  };
};
