// Checkout hook
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '@hooks/useCart';
import { useProducts } from '@hooks/useProducts';
import { validatePhone, isCustomerDisplay as checkIsCustomerDisplay } from '../utils/checkoutUtils';
import { orderService } from '@services/order.service';
import paymentService from '@services/payment.service';
import qrService from '@services/qr.service';
import { STORAGE_KEYS } from '@constants';
import { formatPrice } from '../../../utils/formatPrice';
import { customerService, type Customer } from '../../../services/customer.service';
import { MEMBERSHIP_DISCOUNT_RATES } from '../../../constants/membership';
import type { CustomerInfo, PaymentMethod } from '../types';
import type { QRPaymentData } from '../../../components/features/payment/QRPaymentModal';
import type { CartItem } from '../../../types/cart';

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
  
  // State for found customer and membership discount
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [membershipDiscount, setMembershipDiscount] = useState(0);
  
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
        const restoredCustomerInfo = {
          name: order.customerName || '',
          phone: order.customerPhone || '',
          table: order.customerTable || '',
          notes: order.notes || ''
        };
        setCustomerInfo(restoredCustomerInfo);
        
        // Lookup customer nếu có phone để hiển thị membership badge
        if (restoredCustomerInfo.phone && restoredCustomerInfo.phone.length >= 10) {
          try {
            const customer = await customerService.getByPhone(restoredCustomerInfo.phone);
            if (customer) {
              setFoundCustomer(customer);
              // Tính giảm giá dựa trên hạng
              const discountRate = MEMBERSHIP_DISCOUNT_RATES[customer.membershipLevel] || 0;
              // Tính discount từ totalPrice hiện tại (sẽ được tính lại sau khi restore cart)
              const discount = Math.floor(sumOfSubtotals * (discountRate / 100));
              setMembershipDiscount(discount);
            }
          } catch (error) {
            // Ignore error
          }
        }
        
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
            console.warn(`Product not found: ${orderItem.productId}`);
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

  // Lookup customer when phone number is entered (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (customerInfo.phone && customerInfo.phone.length >= 10) {
        try {
          const customer = await customerService.getByPhone(customerInfo.phone);
          if (customer) {
            setFoundCustomer(customer);
            // Auto-fill name nếu chưa có hoặc name khác với customer.name
            if (customer.name && (!customerInfo.name || customerInfo.name !== customer.name)) {
              setCustomerInfo(prev => ({ ...prev, name: customer.name }));
            }
            // Tính giảm giá dựa trên hạng
            const discountRate = MEMBERSHIP_DISCOUNT_RATES[customer.membershipLevel] || 0;
            const discount = Math.floor(totalPrice * (discountRate / 100));
            setMembershipDiscount(discount);
          } else {
            setFoundCustomer(null);
            setMembershipDiscount(0);
          }
        } catch (error) {
          // Customer không tồn tại - không phải lỗi
          setFoundCustomer(null);
          setMembershipDiscount(0);
        }
      } else {
        setFoundCustomer(null);
        setMembershipDiscount(0);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [customerInfo.phone, totalPrice, customerInfo.name]);
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

      // Khi thanh toán xong (cash), cập nhật order status thành COMPLETED luôn
      // Với card/qr thì backend sẽ tự động update khi payment callback thành công
      if (paymentMethod === 'cash') {
        try {
          console.log('💰 Updating order status to COMPLETED for cash payment', orderData.id);
          await orderService.updateStatus(orderData.id, { status: 'COMPLETED' });
          console.log('✅ Order status updated to COMPLETED successfully');
        } catch (statusError) {
          console.error('❌ Failed to update order status:', statusError);
          // Không block flow nếu update status thất bại
        }
      }
      
      // Hiển thị thông báo về giảm giá thành viên nếu có
      if (orderData.membershipDiscount && parseFloat(orderData.membershipDiscount) > 0) {
        toast.success(
          `Đơn hàng ${orderData.orderNumber} đã được tạo thành công! Bạn đã được giảm ${formatPrice(parseFloat(orderData.membershipDiscount))} nhờ hạng thành viên!`,
          { duration: 4000, icon: '🎉' }
        );
      } else {
        toast.success(`Đơn hàng ${orderData.orderNumber} đã được tạo thành công!`, {
          duration: 3000,
          icon: '✅'
        });
      }
      
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
      
      // Lookup customer again after successful checkout to refresh customer info
      // This ensures newly created customers are displayed correctly
      if (customerInfo.phone && customerInfo.phone.length >= 10) {
        try {
          const refreshedCustomer = await customerService.getByPhone(customerInfo.phone);
          if (refreshedCustomer) {
            setFoundCustomer(refreshedCustomer);
            // Update customer info with refreshed data
            setCustomerInfo(prev => ({
              ...prev,
              name: refreshedCustomer.name || prev.name,
            }));
            console.log('✅ Customer refreshed after checkout:', refreshedCustomer);
          }
        } catch (error) {
          // Customer lookup failed - not critical, continue
          console.warn('⚠️ Could not refresh customer after checkout:', error);
        }
      }
      
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
    // Clear customer flag when leaving checkout
    if (typeof window !== 'undefined' && isCustomerDisplay) {
      sessionStorage.removeItem('checkout_from_customer');
    }
    navigate(isCustomerDisplay ? '/customer' : '/');
  };

  const handleGoHome = () => {
    setOrderSuccessData(null);
    // Clear customer flag when leaving checkout
    if (typeof window !== 'undefined' && isCustomerDisplay) {
      sessionStorage.removeItem('checkout_from_customer');
    }
    navigate(isCustomerDisplay ? '/customer' : '/');
  };

  return {
    items,
    totalPrice,
    customerInfo,
    foundCustomer,
    membershipDiscount,
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
  };
};

