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
  const paymentMethods: Array<{ key: PaymentMethod; icon: React.ReactNode; description?: string; priority?: number }> = isCustomerDisplay
    ? [
        { 
          key: 'qr', 
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ), 
          description: 'QR Code ngân hàng', 
          priority: 1 
        },
        { 
          key: 'cash', 
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ), 
          description: 'Tiền mặt', 
          priority: 2 
        }
      ]
    : [
        { 
          key: 'cash', 
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ), 
          description: 'Tiền mặt' 
        },
        { 
          key: 'qr', 
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ), 
          description: 'QR Code ngân hàng' 
        }
      ];

  const primaryColorClass = 'border-slate-700 bg-slate-50 text-slate-700';

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
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
            className={`p-6 rounded-md border transition-colors ${
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
      
      {isCustomerDisplay && paymentMethod === 'qr' && (
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
  );
};

