import React, { useState, useCallback } from 'react';
import customerService from '@features/customers/services/customer.service';
import type { CustomerInfo } from '../types';

interface SimplifiedCustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * SimplifiedCustomerInfoForm - Simplified form for customer self-service
 * Only requires phone and name (optional)
 */
export const SimplifiedCustomerInfoForm: React.FC<SimplifiedCustomerInfoFormProps> = ({
  customerInfo,
  onInputChange
}) => {
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-save customer when both phone and name are provided
  const autoSaveCustomer = useCallback(async (phone: string, name: string) => {
    if (!phone || phone.length < 10 || !name || name.trim().length === 0) {
      return;
    }

    try {
      await customerService.findOrCreateByPhone(phone, name.trim());
      // Silently save - no UI feedback needed
    } catch (error) {
      console.error('Error auto-saving customer:', error);
      // Silently fail - don't show error to user
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
    const phone = e.target.value;

    // Clear previous timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Auto-save if both phone and name are provided
    if (phone.length >= 10 && customerInfo.name && customerInfo.name.trim().length > 0) {
      const timeout = setTimeout(() => {
        autoSaveCustomer(phone, customerInfo.name);
      }, 500);
      setCheckTimeout(timeout);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
    const name = e.target.value;

    // Auto-save if both phone and name are provided
    if (customerInfo.phone && customerInfo.phone.length >= 10 && name && name.trim().length > 0) {
      // Clear previous timeout
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
      const timeout = setTimeout(() => {
        autoSaveCustomer(customerInfo.phone, name);
      }, 500);
      setCheckTimeout(timeout);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Thông tin đơn hàng
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-800">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={handlePhoneChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-lg"
            placeholder="Nhập số điện thoại (VD: 0912345678)"
            required
            pattern="[0-9]{10,11}"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Ví dụ: 0912345678 hoặc 0123456789
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
            Tên khách hàng
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleNameChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-lg"
            placeholder="Nhập tên (tùy chọn)"
          />
        </div>
      </div>
    </div>
  );
};

