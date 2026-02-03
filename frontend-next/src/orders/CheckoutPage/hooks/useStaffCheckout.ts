"use client";
// Staff Checkout hook - Tách riêng để tránh conflict với customer checkout
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCart } from '@features/orders/hooks/useCart';
import { useProducts } from '@features/products/hooks/useProducts';
import { validatePhone } from '../utils/checkoutUtils';
import { orderService } from '@features/orders/services/order.service';
import qrService from '@features/orders/services/qr.service';
import { STORAGE_KEYS } from '@constants';
import { subscribeToCustomerDiscount } from '@lib/socket.service';
import type { CustomerInfo, PaymentMethod } from '../types';
import type { QRPaymentData } from '@features/orders/components/QRPaymentModal';
import type { CartItem } from '@/types/cart';

export const useStaffCheckout = () => {
  const { items, totalPrice, clearCart, updateOrderStatus, removeFromCart, addToCart, setCartItems, orderCreator } = useCart();
  const { products } = useProducts();
  const navigate = useRouter();
  const location = usePathname();
  
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
  
  // Save discountRate to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('checkout_discount_rate', discountRate.toString());
    window.dispatchEvent(new CustomEvent('discountRateChanged'));
  }, [discountRate]);

  // Sync customer info and discount to draft order when customer info changes
  // CRITICAL: If items empty, delete draft orders instead of syncing empty items
  useEffect(() => {
    if (!orderCreator) {
      return;
    }

    // Debounce sync to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      try {
        // If cart is empty, delete draft orders instead of syncing empty items
        if (items.length === 0) {
          await orderService.deleteDraftOrders(
            orderCreator.type.toUpperCase() as 'STAFF' | 'CUSTOMER',
            orderCreator.name || null
          );
          return;
        }

        // Only sync if has customer info (phone or name)
        if (!customerInfo.phone && !customerInfo.name) {
          return;
        }

        // Calculate discount and VAT
        // Note: totalPrice from cart is WITHOUT VAT (CartContext adds VAT separately)
        const subtotal = totalPrice;
        const discountAmount = discountRate > 0 ? subtotal * (discountRate / 100) : 0;
        const priceAfterDiscount = subtotal - discountAmount;
        const vat = priceAfterDiscount * 0.1;
        const finalTotal = priceAfterDiscount + vat;

        // Map items to order items format (base prices without VAT)
        const orderItems = items.map((item) => {
          let itemPrice = item.basePrice;
          if (item.selectedSize?.extraPrice) {
            itemPrice += item.selectedSize.extraPrice;
          }
          if (item.selectedToppings && item.selectedToppings.length > 0) {
            const toppingsExtra = item.selectedToppings.reduce((sum, topping) => sum + (topping.extraPrice || 0), 0);
            itemPrice += toppingsExtra;
          }

          return {
            productId: String(item.productId),
            quantity: item.quantity,
            price: itemPrice,
            subtotal: item.totalPrice, // This is base price * quantity (no VAT, no discount yet)
            selectedSize: item.selectedSize?.name || null,
            selectedToppings: item.selectedToppings?.map(t => t.name) || [],
            note: item.note || null,
          };
        });

        // Apply discount and VAT proportionally to order items
        const orderItemsWithDiscountAndVAT = [...orderItems];
        const currentTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        
        // Only apply adjustment if there's a discount or if we need to add VAT
        // If discountRate is 0, we still need to add VAT (10%)
        if (discountRate > 0 || finalTotal !== currentTotal) {
          const totalToAdd = finalTotal - currentTotal;
          const distributionFactor = currentTotal > 0 ? totalToAdd / currentTotal : 0;
          
          orderItemsWithDiscountAndVAT.forEach((item, index) => {
            const adjustment = item.subtotal * distributionFactor;
            orderItemsWithDiscountAndVAT[index] = {
              ...item,
              subtotal: item.subtotal + adjustment,
            };
          });
        }

        // Update draft order with customer info and discounted items
        await orderService.createOrUpdateDraft({
          customerName: customerInfo.name || null,
          customerPhone: customerInfo.phone || null,
          customerTable: customerInfo.table || null,
          notes: customerInfo.notes || null,
          orderCreator: orderCreator.type.toUpperCase() as 'STAFF' | 'CUSTOMER',
          orderCreatorName: orderCreator.name || null,
          items: orderItemsWithDiscountAndVAT,
        });
      } catch (error: any) {
        console.error('Failed to sync customer info to draft order:', error);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [customerInfo, discountRate, items, totalPrice, orderCreator]);

  // Listen to real-time customer discount updates via Socket.io
  useEffect(() => {
    const cleanup = subscribeToCustomerDiscount((data) => {
      const normalizePhone = (phone: string) => phone.trim().replace(/[\s\-\(\)]/g, '');
      const currentPhone = normalizePhone(customerInfo.phone);
      const eventPhone = normalizePhone(data.phone);

      if (currentPhone && eventPhone && currentPhone === eventPhone) {
        console.log('📡 Real-time discount update received (Staff):', {
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
  
  const [orderRestored, setOrderRestored] = useState(false);
  
  // Load order and restore cart when continueOrder is true
  useEffect(() => {
    const loadOrderAndRestoreCart = async () => {
      if (!locationState?.continueOrder || !locationState?.orderId) return;
      if (orderRestored) return;
      if (!products || products.length === 0) return;
      
      setOrderRestored(true);
      
      try {
        toast.loading('Đang tải đơn hàng...', { id: 'loading-order' });
        const order = await orderService.getById(locationState.orderId);
        
        if (order && order.items && order.items.length > 0) {
          const cartItems: Omit<CartItem, 'id'>[] = [];
          
          for (const orderItem of order.items) {
            const product = products.find(p => p.id === orderItem.productId);
            if (!product) continue;
            
            let selectedSize = undefined;
            let selectedToppings: Array<{ name: string; extraPrice: number }> = [];
            
            if (orderItem.selectedSize) {
              const sizeOption = product.sizeOptions?.find(s => s.name === orderItem.selectedSize);
              if (sizeOption) {
                selectedSize = {
                  name: sizeOption.name,
                  extraPrice: sizeOption.extraPrice || 0,
                };
              }
            }
            
            if (orderItem.selectedToppings && orderItem.selectedToppings.length > 0) {
              selectedToppings = orderItem.selectedToppings
                .map((toppingName: string) => {
                  const toppingOption = product.toppingOptions?.find(t => t.name === toppingName);
                  return {
                    name: toppingName,
                    extraPrice: toppingOption?.extraPrice || 0,
                  };
                })
                .filter((t: { name: string; extraPrice: number }) => t.name);
            }
            
            const orderItemPrice = parseFloat(orderItem.price);
            let orderItemSubtotal = parseFloat(orderItem.subtotal);
            
            const subtotalsIncludeVAT = order.status !== 'CREATING';
            if (subtotalsIncludeVAT) {
              orderItemSubtotal = orderItemSubtotal / 1.1;
              const adjustedPricePerItem = orderItemPrice / 1.1;
              const sizeExtra = selectedSize?.extraPrice || 0;
              const toppingsExtra = selectedToppings.reduce((sum, t) => sum + (t.extraPrice || 0), 0);
              const calculatedBasePrice = adjustedPricePerItem - sizeExtra - toppingsExtra;
              
              const basePrice = calculatedBasePrice > 0 ? calculatedBasePrice : product.price;
              
              cartItems.push({
                productId: product.id,
                name: product.name,
                image: product.image,
                basePrice: basePrice,
                selectedSize,
                selectedToppings,
                note: orderItem.note || undefined,
                quantity: orderItem.quantity,
                totalPrice: orderItemSubtotal,
                preservePrice: true
              });
            } else {
              const sizeExtra = selectedSize?.extraPrice || 0;
              const toppingsExtra = selectedToppings.reduce((sum, t) => sum + (t.extraPrice || 0), 0);
              const calculatedBasePrice = orderItemPrice - sizeExtra - toppingsExtra;
              
              const basePrice = calculatedBasePrice > 0 ? calculatedBasePrice : product.price;
              
              cartItems.push({
                productId: product.id,
                name: product.name,
                image: product.image,
                basePrice: basePrice,
                selectedSize,
                selectedToppings,
                note: orderItem.note || undefined,
                quantity: orderItem.quantity,
                totalPrice: orderItemSubtotal,
                preservePrice: true
              });
            }
          }
          
          setCartItems(cartItems);
          
          if (order.customerName) {
            setCustomerInfo(prev => ({
              ...prev,
              name: order.customerName || '',
            }));
          }
          if (order.customerPhone) {
            setCustomerInfo(prev => ({
              ...prev,
              phone: order.customerPhone || '',
            }));
          }
          if (order.customerTable) {
            setCustomerInfo(prev => ({
              ...prev,
              table: order.customerTable || '',
            }));
          }
          if (order.notes) {
            setCustomerInfo(prev => ({
              ...prev,
              notes: order.notes || '',
            }));
          }
          
          toast.success('Đã khôi phục đơn hàng', { id: 'loading-order' });
        }
      } catch (error: any) {
        console.error('Error loading order:', error);
        toast.error('Không thể tải đơn hàng', { id: 'loading-order' });
      }
    };

    loadOrderAndRestoreCart();
  }, [locationState, products, orderRestored, setCartItems]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
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

      // STAFF order creation - separate from customer
      const orderData = await orderService.create({
        customerName: customerInfo.name || null,
        customerPhone: customerInfo.phone || null,
        customerTable: customerInfo.table || null,
        notes: customerInfo.notes || null,
        paymentMethod: paymentMethod.toUpperCase() as 'CASH' | 'QR',
        paymentStatus: paymentMethod === 'cash' ? 'SUCCESS' : 'PENDING',
        orderCreator: 'STAFF', // Fixed for staff
        orderCreatorName: 'Nhân viên',
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

      // STAFF cash payment: Auto-complete
      if (paymentMethod === 'cash') {
        try {
          await orderService.updateStatus(orderData.id, { status: 'COMPLETED' });
        } catch (statusError) {
          console.error('❌ Failed to update order status:', statusError);
        }
      }
      
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
        
        // STAFF QR payment: Auto-complete
        try {
          await orderService.updateStatus(qrPaymentData.orderId, { status: 'COMPLETED' });
        } catch (statusError) {
          console.error('❌ Failed to update order status:', statusError);
        }
        
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
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
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
