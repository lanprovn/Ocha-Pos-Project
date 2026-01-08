import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCheckout } from '../CheckoutPage/hooks/useCheckout';
import { useProducts } from '@features/products/hooks/useProducts';
import { useCart } from '@features/orders/hooks/useCart';
import { OrderSummary } from '../CheckoutPage/components/OrderSummary';
import { CustomerInfoForm } from '../CheckoutPage/components/CustomerInfoForm';
import { PaymentMethodSelector } from '../CheckoutPage/components/PaymentMethodSelector';
import { CompleteOrderButton } from '../CheckoutPage/components/CompleteOrderButton';
import { PromotionCodeInput } from '../CheckoutPage/components/PromotionCodeInput';
import OrderSuccessView from '../CheckoutPage/components/OrderSuccessView';
import QRPaymentModal from './QRPaymentModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose,
  onOrderSuccess,
}) => {
  const { products } = useProducts();
  const { setOrderCreator } = useCart();

  // Set order creator as staff when component mounts
  useEffect(() => {
    if (isOpen) {
      setOrderCreator({ type: 'staff', name: 'Nhân Viên POS' });
    }
    return () => {
      if (isOpen) {
        setOrderCreator(null);
      }
    };
  }, [isOpen, setOrderCreator]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const {
    items,
    totalPrice,
    discountRate,
    promotionCode,
    promotionDiscount,
    customerInfo,
    foundCustomer,
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
    handlePromotionCodeChange,
    handlePromotionApplied,
    handlePromotionRemoved,
    handleCustomerFound,
    handleLoyaltyRedemptionChange,
  } = useCheckout();

  // Validation: name + phone required for staff
  const isFormValid = Boolean(customerInfo.name && customerInfo.phone);

  // Handle order success - clear cart and close modal
  const handleOrderSuccess = () => {
    handleNewOrder();
    if (onOrderSuccess) {
      onOrderSuccess();
    }
    // Close modal after a short delay
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // Handle go home - just close modal
  const handleGoHomeAndClose = () => {
    handleNewOrder();
    onClose();
  };

  if (!isOpen) return null;

  // Show success view if order is completed
  if (orderSuccessData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Đặt hàng thành công</h2>
            </div>
            <button
              onClick={handleGoHomeAndClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Success Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="w-[80%] max-w-7xl mx-auto">
              <OrderSuccessView
                orderId={orderSuccessData.orderId}
                orderNumber={orderSuccessData.orderNumber}
                paymentMethod={orderSuccessData.paymentMethod}
                customerName={orderSuccessData.customerName}
                table={orderSuccessData.table}
                onNewOrder={handleOrderSuccess}
                onGoHome={handleGoHomeAndClose}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white w-full md:w-[90%] lg:w-[80%] rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Thanh toán</h2>
                <p className="text-sm text-gray-500">{items.length} món trong giỏ hàng</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Column: Order Summary */}
                <div className="flex flex-col overflow-hidden min-h-0">
                  <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="pr-2 space-y-4">
                      <OrderSummary 
                        items={items} 
                        totalPrice={totalPrice} 
                        discountRate={discountRate}
                        promotionDiscount={promotionDiscount}
                      />
                      <PromotionCodeInput
                        promotionCode={promotionCode}
                        promotionDiscount={promotionDiscount}
                        orderAmount={totalPrice}
                        productIds={items.map(item => item.productId.toString())}
                        categoryIds={items
                          .map(item => {
                            const product = products.find(p => p.id === item.productId);
                            if (product?.categoryId) {
                              return product.categoryId;
                            }
                            if (product?.category && typeof product.category === 'object' && product.category.id) {
                              return product.category.id;
                            }
                            return null;
                          })
                          .filter((id): id is string => !!id)}
                        customerMembershipLevel={foundCustomer?.membershipLevel}
                        customerId={foundCustomer?.id}
                        onPromotionCodeChange={handlePromotionCodeChange}
                        onPromotionApplied={handlePromotionApplied}
                        onPromotionRemoved={handlePromotionRemoved}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer Info, Payment Method */}
                <div className="flex flex-col overflow-hidden min-h-0">
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2">
                    <div className="pr-2">
                      <CustomerInfoForm
                        customerInfo={customerInfo}
                        onInputChange={handleInputChange}
                        onDiscountRateChange={handleDiscountRateChange}
                        onCustomerFound={handleCustomerFound}
                        orderAmount={totalPrice}
                        onLoyaltyRedemptionChange={handleLoyaltyRedemptionChange}
                      />

                      <PaymentMethodSelector
                        paymentMethod={paymentMethod}
                        onPaymentMethodChange={handlePaymentMethodChange}
                        isCustomerDisplay={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Complete Button */}
            <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
              <CompleteOrderButton
                totalPrice={totalPrice}
                itemsCount={items.length}
                isProcessing={isProcessing}
                isFormValid={isFormValid}
                discountRate={discountRate}
                onComplete={handleCompleteOrder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* QR Payment Modal */}
      <QRPaymentModal
        isOpen={showQRModal}
        qrData={qrPaymentData}
        onClose={handleCloseQRModal}
        onVerifyPayment={handleVerifyPayment}
        isVerifying={isVerifyingPayment}
      />
    </>
  );
};

export default CheckoutModal;

