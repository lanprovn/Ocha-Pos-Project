import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import customerService from '@features/customers/services/customer.service';
import type { CustomerInfo, PaymentMethod } from '../types';
import type { Customer } from '@/types/customer';
import { PAYMENT_METHODS } from '../types';

interface CustomerInfoAndPaymentBoxProps {
  customerInfo: CustomerInfo;
  paymentMethod: PaymentMethod;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCustomerFound?: (customer: Customer) => void;
  onDiscountRateChange?: (discountRate: number) => void;
}

const membershipLevelLabels: Record<string, string> = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  PLATINUM: 'Bạch Kim',
};

const membershipLevelColors: Record<string, string> = {
  BRONZE: 'bg-amber-100 text-amber-800',
  SILVER: 'bg-gray-100 text-gray-800',
  GOLD: 'bg-yellow-100 text-yellow-800',
  PLATINUM: 'bg-purple-100 text-purple-800',
};

/**
 * CustomerInfoAndPaymentBox - Combined customer info and payment method selector
 * For customer checkout - gộp thông tin đơn hàng và phương thức thanh toán vào 1 box
 */
export const CustomerInfoAndPaymentBox: React.FC<CustomerInfoAndPaymentBoxProps> = ({
  customerInfo,
  paymentMethod,
  onInputChange,
  onPaymentMethodChange,
  onCustomerFound,
  onDiscountRateChange,
}) => {
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const checkCustomer = useCallback(async (phone: string) => {
    if (!phone || phone.length < 10) {
      setFoundCustomer(null);
      setDiscountRate(0);
      if (onDiscountRateChange) {
        onDiscountRateChange(0);
      }
      return;
    }

    setIsChecking(true);
    try {
      const result = await customerService.findByPhone(phone);
      if (result.exists && result.customer) {
        setFoundCustomer(result.customer);
        // Get discount rate for customer's membership level
        const discountInfo = await customerService.getDiscountRate(result.customer.membershipLevel);
        setDiscountRate(discountInfo.discountRate);
        if (onDiscountRateChange) {
          onDiscountRateChange(discountInfo.discountRate);
        }
        if (onCustomerFound) {
          onCustomerFound(result.customer);
        }
        // Auto-fill name if customer is found (always update, not just when empty)
        if (result.customer.name) {
          const event = {
            target: { name: 'name', value: result.customer.name },
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(event);
        }
      } else {
        setFoundCustomer(null);
        setDiscountRate(0);
        if (onDiscountRateChange) {
          onDiscountRateChange(0);
        }
      }
    } catch (error) {
      console.error('Error checking customer:', error);
      setFoundCustomer(null);
    } finally {
      setIsChecking(false);
    }
  }, [onCustomerFound, onInputChange, onDiscountRateChange]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
    const phone = e.target.value;

    // Clear previous timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Debounce: Check customer after 500ms of no typing
    const timeout = setTimeout(() => {
      checkCustomer(phone);
    }, 500);

    setCheckTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
    };
  }, [checkTimeout]);

  // Payment methods for customer
  const paymentMethods: Array<{ key: PaymentMethod; icon: React.ReactNode; description?: string }> = [
    { 
      key: 'qr', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ), 
      description: 'QR Code ngân hàng'
    },
    { 
      key: 'card', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ), 
      description: 'Thẻ ngân hàng (VNPay)'
    },
    { 
      key: 'cash', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ), 
      description: 'Tiền mặt'
    }
  ];

  const primaryColorClass = 'border-slate-700 bg-slate-50 text-slate-700';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin">
        <div className="pr-2 space-y-6">
          {/* Customer Information Section */}
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin đơn hàng
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
                  Tên khách hàng
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={onInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-lg ${
                    foundCustomer ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên khách hàng (tùy chọn)"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-800">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-lg ${
                      foundCustomer ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số điện thoại (VD: 0912345678)"
                    required
                    pattern="[0-9]{10,11}"
                    autoFocus
                  />
                  {isChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                    </div>
                  )}
                  {foundCustomer && !isChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ví dụ: 0912345678 hoặc 0123456789
                </p>
                {foundCustomer && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <InformationCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                          Khách hàng đã tồn tại trong hệ thống
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                          <span
                            className={`px-2 py-1 rounded-full font-medium ${
                              membershipLevelColors[foundCustomer.membershipLevel] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {membershipLevelLabels[foundCustomer.membershipLevel] || foundCustomer.membershipLevel}
                          </span>
                          {discountRate > 0 && (
                            <span className="px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                              Giảm {discountRate}%
                            </span>
                          )}
                          <span className="text-gray-600">
                            Điểm tích lũy: <span className="font-semibold">{foundCustomer.loyaltyPoints.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Phương thức thanh toán
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.key}
                  onClick={() => onPaymentMethodChange(method.key)}
                  className={`p-4 lg:p-6 rounded-md border transition-colors ${
                    paymentMethod === method.key
                      ? `${primaryColorClass} shadow-sm`
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-3 text-gray-700">{method.icon}</div>
                    <div className="font-semibold text-sm mb-1">{PAYMENT_METHODS[method.key]}</div>
                    {method.description && (
                      <div className="text-xs text-gray-500 mt-1">{method.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {paymentMethod === 'qr' && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-300 rounded-md">
                <p className="text-sm text-slate-700 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Quét mã QR để thanh toán nhanh chóng và an toàn
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

