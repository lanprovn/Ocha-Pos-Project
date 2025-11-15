import React from 'react';
import type { PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../types';

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  isCustomerDisplay?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  isCustomerDisplay = false
}) => {
  // For customer display: prioritize QR code
  // For staff: show cash first, then QR
  const paymentMethods: Array<{ key: PaymentMethod; icon: string; description?: string; priority?: number }> = isCustomerDisplay
    ? [
        { key: 'qr', icon: '📱', description: 'QR Code ngân hàng', priority: 1 },
        { key: 'cash', icon: '💵', description: 'Tiền mặt', priority: 2 }
      ]
    : [
        { key: 'cash', icon: '💵', description: 'Tiền mặt' },
        { key: 'qr', icon: '📱', description: 'QR Code ngân hàng' }
      ];

  const primaryColor = isCustomerDisplay ? 'emerald' : 'orange';
  const primaryColorClass = isCustomerDisplay 
    ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
    : 'border-orange-500 bg-orange-50 text-orange-600';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Phương thức thanh toán
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.key}
            onClick={() => onPaymentMethodChange(method.key)}
            className={`p-6 rounded-lg border-2 transition-all duration-300 ${
              paymentMethod === method.key
                ? `${primaryColorClass} shadow-md scale-105`
                : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-sm'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-3">{method.icon}</div>
              <div className="font-semibold text-sm mb-1">{PAYMENT_METHODS[method.key]}</div>
              {method.description && (
                <div className="text-xs text-gray-500 mt-1">{method.description}</div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {isCustomerDisplay && paymentMethod === 'qr' && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-800 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quét mã QR để thanh toán nhanh chóng và an toàn
          </p>
        </div>
      )}
    </div>
  );
};

