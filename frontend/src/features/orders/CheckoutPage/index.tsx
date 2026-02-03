import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import { useStaffCheckout } from './hooks/useStaffCheckout';
import { useCustomerCheckout } from './hooks/useCustomerCheckout';
import { OrderSummary } from './components/OrderSummary';
import { CustomerInfoForm } from './components/CustomerInfoForm';
import { SimplifiedCustomerInfoForm } from './components/SimplifiedCustomerInfoForm';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { DiningOptionSelector } from './components/DiningOptionSelector';
import { CompleteOrderButton } from './components/CompleteOrderButton';
import OrderSuccessView from './components/OrderSuccessView';
import QRPaymentModal from '@features/orders/components/QRPaymentModal';
import { isCustomerDisplay as checkIsCustomerDisplay } from './utils/checkoutUtils';

// Shadcn UI
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isCustomerDisplay = checkIsCustomerDisplay(location.pathname, location.state as any);

  const staffCheckout = useStaffCheckout();
  const customerCheckout = useCustomerCheckout();
  const checkout = isCustomerDisplay ? customerCheckout : staffCheckout;

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
  } = checkout;

  const isFormValid = isCustomerDisplay
    ? Boolean(customerInfo.phone)
    : Boolean(customerInfo.name && customerInfo.phone);

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
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Checkout Content Grid - Removed Header as it's now in POSLayoutNew */}
      <div className="flex-1 overflow-hidden p-8">
        <div className="max-w-[1400px] mx-auto h-full flex flex-col md:flex-row gap-8">
          {/* Left: Summary Panel */}
          <div className="w-full md:w-[480px] lg:w-[550px] flex flex-col h-full">
            <div className="mb-4 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-800" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Tóm tắt đơn hàng</h2>
              </div>
              <Badge variant="outline" className="bg-slate-900/5 text-slate-900 border-slate-900/10 font-black">
                {items.length} món
              </Badge>
            </div>

            <Card className="flex-1 overflow-hidden border-none shadow-xl shadow-slate-200 rounded-[40px]">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <OrderSummary items={items} totalPrice={totalPrice} discountRate={discountRate} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Payment & Info Panel */}
          <div className="flex-1 flex flex-col h-full">
            <div className="mb-4 flex items-center gap-2 px-2">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Thông tin & Thanh toán</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6 pb-20">
              {/* Customer Info */}
              <Card className="border-none shadow-xl shadow-slate-200 rounded-[40px] overflow-hidden">
                <CardContent className="p-8">
                  {isCustomerDisplay ? (
                    <SimplifiedCustomerInfoForm
                      customerInfo={customerInfo}
                      onInputChange={handleInputChange}
                      onDiscountRateChange={handleDiscountRateChange}
                    />
                  ) : (
                    <CustomerInfoForm
                      customerInfo={customerInfo}
                      onInputChange={handleInputChange}
                      onDiscountRateChange={handleDiscountRateChange}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Dining Selector */}
              <Card className="border-none shadow-xl shadow-slate-200 rounded-[40px] overflow-hidden">
                <CardContent className="p-8">
                  <DiningOptionSelector
                    value={(customerInfo.table || '').toLowerCase() === 'mang về' ? 'takeaway' : 'dine-in'}
                    onChange={(val) => handleInputChange('table', val === 'takeaway' ? 'Mang về' : '')}
                    tableNumber={(customerInfo.table || '').toLowerCase() === 'mang về' ? '' : customerInfo.table || ''}
                    onTableNumberChange={(val) => handleInputChange('table', val)}
                  />
                </CardContent>
              </Card>

              {/* Payment Method Selector */}
              <Card className="border-none shadow-xl shadow-slate-200 rounded-[40px] overflow-hidden">
                <CardContent className="p-8">
                  <PaymentMethodSelector
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={handlePaymentMethodChange}
                    isCustomerDisplay={isCustomerDisplay}
                  />
                </CardContent>
              </Card>

              <div className="pb-8">
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
