// Checkout hook
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '@features/orders/hooks/useCart';
import { useProducts } from '@features/products/hooks/useProducts';
import { validatePhone, isCustomerDisplay as checkIsCustomerDisplay } from '../utils/checkoutUtils';
import { orderService } from '@features/orders/services/order.service';
import paymentService from '@features/orders/services/payment.service';
import qrService from '@features/orders/services/qr.service';
import { STORAGE_KEYS } from '@constants';
import type { CustomerInfo, PaymentMethod } from '../types';
import type { QRPaymentData } from '@features/orders/components/QRPaymentModal';
import type { CartItem } from '@/types/cart';

export const useCheckout = () => {
  const { items, totalPrice, clearCart, updateOrderStatus, removeFromCart, addToCart, setCartItems } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load table number from localStorage or location state
  const savedTableNumber = localStorage.getItem('customer_table_number');
  const locationState = location.state as { 
    tableNumber?: string; 
    orderId?: string;
    continueOrder?: boolean;
  } | null;
  const initialTableNumber = locationState?.tableNumber || savedTableNumber || '';
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    table: initialTableNumber,
    notes: ''
  });
  
  const [discountRate, setDiscountRate] = useState<number>(0);
  
  // Flag to track if order has been restored
  const [orderRestored, setOrderRestored] = useState(false);
  
  // Load order and restore cart when continueOrder is true
  useEffect(() => {
    const loadOrderAndRestoreCart = async () => {
      // Only proceed if continueOrder flag is set and orderId exists
      if (!locationState?.continueOrder || !locationState?.orderId) return;
      
      // Prevent duplicate loads
      if (orderRestored) return;
      
      // Wait for products to load
      if (!products || products.length === 0) {
        return;
      }
      
      // Mark as restoring to prevent duplicate loads
      setOrderRestored(true);
      
      try {
        // Show loading toast
        toast.loading('Đang tải đơn hàng...', { id: 'restore-order' });
        
        // Load order from API
        const order = await orderService.getById(locationState.orderId);
        
        // Check if order subtotals include VAT
        // If order.totalAmount equals sum of subtotals, then subtotals already include VAT
        const sumOfSubtotals = order.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        const orderTotalAmount = parseFloat(order.totalAmount);
        const subtotalsIncludeVAT = Math.abs(sumOfSubtotals - orderTotalAmount) < 1; // Allow small rounding difference
        
        // Restore customer info first (before clearing cart)
        setCustomerInfo({
          name: order.customerName || '',
          phone: order.customerPhone || '',
          table: order.customerTable || '',
          notes: order.notes || ''
        });
        
        // Restore payment method
        if (order.paymentMethod) {
          const method = order.paymentMethod.toLowerCase() as PaymentMethod;
          if (['cash', 'card', 'qr'].includes(method)) {
            setPaymentMethod(method);
          }
        }
        
        // Transform order items to cart items BEFORE clearing cart
        const cartItems: Omit<CartItem, 'id'>[] = [];
        
        for (const orderItem of order.items) {
          // Find product to get full details
          const product = products.find(p => p.id.toString() === orderItem.productId);
          
          if (!product) {
            // Product not found - skip
            continue;
          }
          
          // Find matching size
          let selectedSize: CartItem['selectedSize'] = undefined;
          if (orderItem.selectedSize && product.sizes) {
            const size = product.sizes.find(s => s.name === orderItem.selectedSize);
            if (size) {
              selectedSize = size;
            } else {
              // Create size object from name if not found
              selectedSize = {
                name: orderItem.selectedSize,
                extraPrice: 0
              };
            }
          }
          
          // Find matching toppings
          const selectedToppings: CartItem['selectedToppings'] = [];
          if (orderItem.selectedToppings && orderItem.selectedToppings.length > 0 && product.toppings) {
            for (const toppingName of orderItem.selectedToppings) {
              const topping = product.toppings.find(t => t.name === toppingName);
              if (topping) {
                selectedToppings.push(topping);
              } else {
                // Create topping object from name if not found
                selectedToppings.push({
                  name: toppingName,
                  extraPrice: 0
                });
              }
            }
          }
          
          // Use exact price from order item to preserve original pricing
          // orderItem.price = price per item (including size and toppings)
          // orderItem.subtotal = total price for this item (price * quantity)
          const orderItemPrice = parseFloat(orderItem.price);
          let orderItemSubtotal = parseFloat(orderItem.subtotal);
          
          // If subtotals include VAT, we need to extract the original subtotal (without VAT)
          // VAT is 10%, so: subtotal_with_VAT = subtotal_without_VAT * 1.1
          // Therefore: subtotal_without_VAT = subtotal_with_VAT / 1.1
          if (subtotalsIncludeVAT) {
            // Extract VAT from subtotal: divide by 1.1 to get original subtotal
            orderItemSubtotal = orderItemSubtotal / 1.1;
            // Also adjust price per item
            const adjustedPricePerItem = orderItemPrice / 1.1;
            // Recalculate basePrice from adjusted price
            const sizeExtra = selectedSize?.extraPrice || 0;
            const toppingsExtra = selectedToppings.reduce((sum, t) => sum + (t.extraPrice || 0), 0);
            const calculatedBasePrice = adjustedPricePerItem - sizeExtra - toppingsExtra;
            
            const basePrice = calculatedBasePrice > 0 
              ? calculatedBasePrice 
              : product.price;
            
            cartItems.push({
              productId: product.id,
              name: product.name,
              image: product.image,
              basePrice: basePrice,
              selectedSize,
              selectedToppings,
              note: orderItem.note || undefined,
              quantity: orderItem.quantity,
              totalPrice: orderItemSubtotal, // Use subtotal without VAT
              preservePrice: true
            });
          } else {
            // Subtotals don't include VAT, use as-is
            const sizeExtra = selectedSize?.extraPrice || 0;
            const toppingsExtra = selectedToppings.reduce((sum, t) => sum + (t.extraPrice || 0), 0);
            const calculatedBasePrice = orderItemPrice - sizeExtra - toppingsExtra;
            
            const basePrice = calculatedBasePrice > 0 
              ? calculatedBasePrice 
              : product.price;
            
            cartItems.push({
              productId: product.id,
              name: product.name,
              image: product.image,
              basePrice: basePrice,
              selectedSize,
              selectedToppings,
              note: orderItem.note || undefined,
              quantity: orderItem.quantity,
              totalPrice: orderItemSubtotal, // Use exact subtotal from order
              preservePrice: true
            });
          }
        }
        
        // Set cart items directly (replace all, no merge)
        // This avoids the double issue when restoring orders
        setCartItems(cartItems);
        
        // Show success toast
        toast.success(`Đã khôi phục ${cartItems.length} món từ đơn hàng ${order.orderNumber}`, {
          id: 'restore-order',
          duration: 3000,
          icon: '✅'
        });
      } catch (error: any) {
        console.error('Error loading order:', error);
        toast.error('Không thể tải đơn hàng. Vui lòng thử lại.', {
          id: 'restore-order'
        });
        // Reset flag on error so user can retry
        setOrderRestored(false);
      }
    };
    
    loadOrderAndRestoreCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationState?.continueOrder, locationState?.orderId, products.length]);
  
  // Reset orderRestored flag when orderId changes (to allow restoring different orders)
  useEffect(() => {
    if (locationState?.orderId) {
      setOrderRestored(false);
    }
  }, [locationState?.orderId]);
  // For customer display: default to QR code (preferred)
  // For staff: default to cash
  const isCustomerDisplay = checkIsCustomerDisplay(location.pathname, location.state as any);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isCustomerDisplay ? 'qr' : 'cash');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrPaymentData, setQrPaymentData] = useState<QRPaymentData | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: string;
    orderNumber: string;
    paymentMethod: PaymentMethod;
    customerName?: string;
    table?: string;
  } | null>(null);

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
      // Calculate discount and final total
      const subtotal = totalPrice;
      const discountAmount = discountRate > 0 ? subtotal * (discountRate / 100) : 0;
      const priceAfterDiscount = subtotal - discountAmount;
      const vat = priceAfterDiscount * 0.1;
      const finalTotal = priceAfterDiscount + vat;

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
      // Apply discount and VAT to order items
      // Backend sẽ tính totalAmount từ tổng các subtotal
      // Giải pháp: Áp dụng discount và VAT vào subtotal của các items để tổng = finalTotal
      const orderItemsWithDiscountAndVAT = [...orderItems];
      if (orderItemsWithDiscountAndVAT.length > 0) {
        const currentTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const totalToAdd = finalTotal - currentTotal;
        
        // Distribute discount and VAT proportionally across items
        const distributionFactor = totalToAdd / currentTotal;
        orderItemsWithDiscountAndVAT.forEach((item, index) => {
          const adjustment = item.subtotal * distributionFactor;
          orderItemsWithDiscountAndVAT[index] = {
            ...item,
            subtotal: item.subtotal + adjustment,
          };
        });
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
        items: orderItemsWithDiscountAndVAT, // Sử dụng items có discount và VAT được thêm vào
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

      // Khi thanh toán xong (cash), cập nhật order status thành COMPLETED luôn
      // Với card/qr thì backend sẽ tự động update khi payment callback thành công
      if (paymentMethod === 'cash') {
        try {
          // Update order status to COMPLETED for cash payment
          await orderService.updateStatus(orderData.id, { status: 'COMPLETED' });
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
      
      // Update order status to completed (vì đã thanh toán xong)
      updateOrderStatus('completed', {
        name: customerInfo.name || 'Khách hàng',
        table: customerInfo.table || undefined
      }, paymentMethod, 'success');
      
      // Small delay để đảm bảo socket events được emit và nhận
      await new Promise(resolve => setTimeout(resolve, 800));
      
      clearCart();
      
      // Set success data instead of navigating
      setOrderSuccessData({
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
        paymentMethod,
        customerName: customerInfo.name,
        table: customerInfo.table,
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
      
      // Set success data instead of navigating
      setOrderSuccessData({
        orderId: qrPaymentData.orderId,
        orderNumber: qrPaymentData.orderNumber,
        paymentMethod: 'qr',
        customerName: customerInfo.name,
        table: customerInfo.table,
      });
      
      setQrPaymentData(null);
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

  const handleNewOrder = () => {
    setOrderSuccessData(null);
    navigate(isCustomerDisplay ? '/customer' : '/');
  };

  const handleGoHome = () => {
    setOrderSuccessData(null);
    navigate(isCustomerDisplay ? '/customer' : '/');
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
    handleDiscountRateChange: setDiscountRate,
  };
};

