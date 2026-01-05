import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCheckout } from './hooks/useCheckout';
import { OrderSummary } from './components/OrderSummary';
import { CustomerInfoForm } from './components/CustomerInfoForm';
import { SimplifiedCustomerInfoForm } from './components/SimplifiedCustomerInfoForm';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { CompleteOrderButton } from './components/CompleteOrderButton';
import OrderSuccessView from './components/OrderSuccessView';
import HomeButton from '@components/ui/HomeButton';
import QRPaymentModal from '@features/orders/components/QRPaymentModal';
import { isCustomerDisplay as checkIsCustomerDisplay } from './utils/checkoutUtils';

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isCustomerDisplay = checkIsCustomerDisplay(location.pathname, location.state as any);

  const {
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
  } = useCheckout();

  // Simplified validation for customer: only phone required
  // Staff: name + phone required
  const isFormValid = isCustomerDisplay
    ? Boolean(customerInfo.phone)
    : Boolean(customerInfo.name && customerInfo.phone);

  // Show success view if order is completed
  if (orderSuccessData) {
    return (
      <OrderSuccessView
        orderId={orderSuccessData.orderId}
        orderNumber={orderSuccessData.orderNumber}
        paymentMethod={orderSuccessData.paymentMethod}
        customerName={orderSuccessData.customerName}
        table={orderSuccessData.table}
        onNewOrder={handleNewOrder}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full flex-shrink-0">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate(-1)}
              className="hover:text-gray-800 transition-colors flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{isCustomerDisplay ? 'Menu' : 'POS System'}</span>
            </button>
            <span>/</span>
            <span className="text-gray-800 font-medium">Thanh toán</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Chỉ hiển thị nút "Đơn hàng" cho staff, không hiển thị cho customer */}
            {!isCustomerDisplay && (
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm"
                title="Xem đơn hàng"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Đơn hàng</span>
              </button>
            )}
            <HomeButton size="sm" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full">
            {/* Left Column: Order Summary - Scroll được */}
            <div className="order-2 lg:order-1 flex flex-col overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="pr-2">
                  <OrderSummary items={items} totalPrice={totalPrice} discountRate={discountRate} />
                </div>
              </div>
            </div>

            {/* Right Column: Customer Info, Payment Method, Complete Button - Scroll được */}
            <div className="order-1 lg:order-2 flex flex-col overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2">
                <div className="pr-2">
                  {isCustomerDisplay ? (
                    <SimplifiedCustomerInfoForm
                      customerInfo={customerInfo}
                      onInputChange={handleInputChange}
                    />
                  ) : (
                    <CustomerInfoForm
                      customerInfo={customerInfo}
                      onInputChange={handleInputChange}
                      onDiscountRateChange={handleDiscountRateChange}
                    />
                  )}

                  <PaymentMethodSelector
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={handlePaymentMethodChange}
                    isCustomerDisplay={isCustomerDisplay}
                  />
                </div>
              </div>

              {/* Complete Button - Cố định ở dưới */}
              <div className="flex-shrink-0 pt-6">
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
      </div>

      {/* QR Payment Modal */}
      <QRPaymentModal
        isOpen={showQRModal}
        qrData={qrPaymentData}
        onClose={handleCloseQRModal}
        onVerifyPayment={handleVerifyPayment}
        isVerifying={isVerifyingPayment}
      />
    </div>
  );
};

export default CheckoutPage;

