// Checkout hook
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '@hooks/useCart';
import { validatePhone } from '../utils/checkoutUtils';
import { orderService } from '@services/order.service';
import paymentService from '@services/payment.service';
import qrService from '@services/qr.service';
import { STORAGE_KEYS } from '@constants';
import type { CustomerInfo, PaymentMethod } from '../types';
import type { QRPaymentData } from '../../../components/features/payment/QRPaymentModal';

export const useCheckout = () => {
  const { items, totalPrice, clearCart, updateOrderStatus } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load table number from localStorage or location state
  const savedTableNumber = localStorage.getItem('customer_table_number');
  const locationState = location.state as { tableNumber?: string } | null;
  const initialTableNumber = locationState?.tableNumber || savedTableNumber || '';
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    table: initialTableNumber,
    notes: ''
  });
  // For customer display: default to QR code (preferred)
  // For staff: default to cash
  // Check if checkout is from customer page (via state or referrer)
  const isCustomerDisplay = location.pathname.startsWith('/customer') || 
    (location.state as any)?.fromCustomer === true;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isCustomerDisplay ? 'qr' : 'cash');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrPaymentData, setQrPaymentData] = useState<QRPaymentData | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method: PaymentMethod): void => {
    setPaymentMethod(method);
  };

  const handleCompleteOrder = async (): Promise<void> => {
    // Validate phone number
    if (!validatePhone(customerInfo.phone)) {
      toast.error('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10-11 chữ số.');
      return;
    }

    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Tính VAT 10% và tổng cuối cùng
      const vat = totalPrice * 0.1;
      const finalTotal = totalPrice + vat;

      // Prepare order data for API
      const orderItems = items.map(item => {
        // Calculate price per item (base price + size extra + toppings extra)
        let itemPrice = item.basePrice;
        if (item.selectedSize?.extraPrice) {
          itemPrice += item.selectedSize.extraPrice;
        }
        if (item.selectedToppings && item.selectedToppings.length > 0) {
          const toppingsExtra = item.selectedToppings.reduce((sum, topping) => sum + (topping.extraPrice || 0), 0);
          itemPrice += toppingsExtra;
        }

        return {
          productId: item.productId.toString(), // Convert to string (UUID)
          quantity: item.quantity,
          price: itemPrice,
          subtotal: item.totalPrice,
          selectedSize: item.selectedSize?.name || null,
          selectedToppings: item.selectedToppings?.map(t => t.name) || [],
          note: item.note || null,
        };
      });

      // Create order via API
      // Payment status: cash = SUCCESS ngay, card/qr = PENDING (sẽ update sau khi thanh toán)
      // VAT 10% được tính ở tổng, không tính vào từng item
      // Backend sẽ tính totalAmount từ tổng các subtotal, nhưng chúng ta cần đảm bảo tổng cuối cùng có VAT
      // Giải pháp: Thêm VAT vào subtotal của item cuối cùng để tổng = finalTotal
      const orderItemsWithVAT = [...orderItems];
      if (orderItemsWithVAT.length > 0) {
        // Thêm VAT vào item cuối cùng để tổng = finalTotal
        const lastItem = orderItemsWithVAT[orderItemsWithVAT.length - 1];
        const currentTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const vatToAdd = finalTotal - currentTotal;
        orderItemsWithVAT[orderItemsWithVAT.length - 1] = {
          ...lastItem,
          subtotal: lastItem.subtotal + vatToAdd,
        };
      }

      // Tạo order mới (status sẽ là PENDING, không phải CREATING)
      // Backend sẽ tự động xóa draft order cũ khi tạo order mới
      const orderData = await orderService.create({
        customerName: customerInfo.name || null,
        customerPhone: customerInfo.phone || null,
        customerTable: customerInfo.table || null,
        notes: customerInfo.notes || null,
        paymentMethod: paymentMethod.toUpperCase() as 'CASH' | 'CARD' | 'QR',
        paymentStatus: paymentMethod === 'cash' ? 'SUCCESS' : 'PENDING',
        orderCreator: isCustomerDisplay ? 'CUSTOMER' : 'STAFF',
        orderCreatorName: isCustomerDisplay ? 'Khách Hàng' : 'Nhân viên',
        items: orderItemsWithVAT, // Sử dụng items có VAT được thêm vào
      });

      // Nếu là card, tạo payment URL và redirect đến payment gateway
      if (paymentMethod === 'card') {
        try {
          const paymentResponse = await paymentService.createPayment({
            orderId: orderData.id,
            paymentMethod: 'VNPAY',
          });

          // Không cần lưu vào localStorage nữa vì đã có trong backend

          // Redirect đến payment gateway
          toast.loading('Đang chuyển đến trang thanh toán...', { id: 'payment-redirect' });
          window.location.href = paymentResponse.paymentUrl;
          return; // Không clear cart hay navigate ở đây, sẽ làm ở callback
        } catch (paymentError: any) {
          console.error('Payment creation error:', paymentError);
          toast.error(paymentError?.message || 'Không thể tạo thanh toán. Vui lòng thử lại.');
          setIsProcessing(false);
          return;
        }
      }

      // Nếu là qr, tạo QR code và hiển thị modal
      if (paymentMethod === 'qr') {
        try {
          const qrResponse = await qrService.generateQR(orderData.id);

          // Lưu order vào localStorage
          // Không cần lưu vào localStorage nữa vì đã có trong backend

          // Hiển thị QR modal
          setQrPaymentData(qrResponse);
          setShowQRModal(true);
          setIsProcessing(false);
          toast.success('Mã QR đã được tạo. Vui lòng quét mã để thanh toán.', {
            duration: 5000,
            icon: '📱',
          });
          return; // Không clear cart hay navigate ở đây, sẽ làm sau khi verify
        } catch (qrError: any) {
          console.error('QR generation error:', qrError);
          toast.error(qrError?.message || 'Không thể tạo mã QR. Vui lòng thử lại.');
          setIsProcessing(false);
          return;
        }
      }

      // Nếu là cash, xử lý như bình thường
      // Update order status to COMPLETED sau khi thanh toán thành công
      // Chỉ update nếu payment method là cash (đã thanh toán ngay)
      if (paymentMethod === 'cash') {
        try {
          console.log('💰 Updating order status to COMPLETED for cash payment', orderData.id);
          await orderService.updateStatus(orderData.id, { status: 'COMPLETED' });
          console.log('✅ Order status updated successfully');
        } catch (statusError) {
          console.error('❌ Failed to update order status:', statusError);
          // Không block flow nếu update status thất bại
        }
      }
      
      toast.success(`Đơn hàng ${orderData.orderNumber} đã được tạo thành công!`, {
        duration: 3000,
        icon: '✅'
      });
      
      // Dispatch custom event for real-time updates (fallback nếu socket không hoạt động)
      window.dispatchEvent(new CustomEvent('orderCompleted', {
        detail: { 
          orderId: orderData.id, 
          orderNumber: orderData.orderNumber, 
          total: totalPrice, 
          items: items.length 
        }
      }));
      
      // Update order status to paid and sync to display
      updateOrderStatus('paid', {
        name: customerInfo.name || 'Khách hàng',
        table: customerInfo.table || undefined
      }, paymentMethod, 'success');
      
      // Small delay để đảm bảo socket events được emit và nhận
      await new Promise(resolve => setTimeout(resolve, 800));
      
      clearCart();
      navigate('/order-success', {
        state: {
          orderId: orderData.id,
          orderNumber: orderData.orderNumber,
          paymentMethod,
          customerName: customerInfo.name,
          table: customerInfo.table,
          fromCustomer: isCustomerDisplay // Đánh dấu đến từ customer page
        }
      });
    } catch (error: any) {
      console.error('Error processing order:', error);
      const errorMessage = error?.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra kết nối mạng và thử lại.';
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!qrPaymentData) return;

    setIsVerifyingPayment(true);
    try {
      await qrService.verifyPayment(qrPaymentData.orderId);

      // Update order status to COMPLETED sau khi verify payment thành công
      try {
        await orderService.updateStatus(qrPaymentData.orderId, { status: 'COMPLETED' });
      } catch (statusError) {
        console.error('Failed to update order status:', statusError);
        // Không block flow nếu update status thất bại
      }

      toast.success('Thanh toán đã được xác nhận!', {
        duration: 3000,
        icon: '✅',
      });

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('orderCompleted', {
        detail: {
          orderId: qrPaymentData.orderId,
          orderNumber: qrPaymentData.orderNumber,
          total: qrPaymentData.totalAmount,
          items: items.length,
        },
      }));

      // Update order status
      updateOrderStatus('paid', {
        name: customerInfo.name || 'Khách hàng',
        table: customerInfo.table || undefined,
      }, 'qr', 'success');

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      clearCart();
      setShowQRModal(false);
      setQrPaymentData(null);
      navigate('/order-success', {
        state: {
          orderId: qrPaymentData.orderId,
          orderNumber: qrPaymentData.orderNumber,
          paymentMethod: 'qr',
          customerName: customerInfo.name,
          table: customerInfo.table,
        },
      });
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error(error?.message || 'Không thể xác nhận thanh toán. Vui lòng thử lại.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setQrPaymentData(null);
  };

  return {
    items,
    totalPrice,
    customerInfo,
    paymentMethod,
    isProcessing,
    showQRModal,
    qrPaymentData,
    isVerifyingPayment,
    handleInputChange,
    handlePaymentMethodChange,
    handleCompleteOrder,
    handleVerifyPayment,
    handleCloseQRModal,
  };
};

