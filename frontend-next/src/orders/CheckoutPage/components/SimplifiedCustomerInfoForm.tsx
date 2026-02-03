"use client";
import React, { useState, useCallback, useEffect } from 'react';
import customerService from '@features/customers/services/customer.service';
import { subscribeToCustomerDiscount } from '@lib/socket.service';
import type { CustomerInfo } from '../types';
import type { Customer } from '@/types/customer';

interface SimplifiedCustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDiscountRateChange?: (discountRate: number) => void;
  onCustomerFound?: (customer: Customer) => void;
}

/**
 * SimplifiedCustomerInfoForm - Simplified form for customer self-service
 * Only requires phone and name (optional)
 * Auto-fills name and discount rate when member phone is entered
 */
export const SimplifiedCustomerInfoForm: React.FC<SimplifiedCustomerInfoFormProps> = ({
  customerInfo,
  onInputChange,
  onDiscountRateChange,
  onCustomerFound,
}) => {
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check customer by phone number
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
        // Auto-fill name (always update, not just when empty) khi tìm thấy customer
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

  // Auto-save customer when both phone and name are provided
  const autoSaveCustomer = useCallback(async (phone: string, name: string) => {
    if (!phone || phone.length < 10 || !name || name.trim().length === 0) {
      return;
    }

    try {
      const result = await customerService.findOrCreateByPhone(phone, name.trim());
      if (result.customer) {
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
      }
    } catch (error) {
      console.error('Error auto-saving customer:', error);
      // Silently fail - don't show error to user
    }
  }, [onCustomerFound, onDiscountRateChange]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    onInputChange(e);

    // Clear previous timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Nếu xóa số điện thoại (phone rỗng hoặc < 10 ký tự), reset tên và discount rate ngay lập tức
    if (!phone || phone.length < 10) {
      setFoundCustomer(null);
      setDiscountRate(0);
      if (onDiscountRateChange) {
        onDiscountRateChange(0);
      }
      // Clear name field nếu đã được auto-fill từ customer
      if (foundCustomer && customerInfo.name === foundCustomer.name) {
        const event = {
          target: { name: 'name', value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(event);
      }
      return;
    }

    // Debounce: Check customer after 500ms of no typing
    const timeout = setTimeout(() => {
      // If name is already provided, use autoSaveCustomer (which handles both check and create)
      // Otherwise, just check if customer exists
      if (phone.length >= 10 && customerInfo.name && customerInfo.name.trim().length > 0) {
        // Both phone and name provided - use autoSaveCustomer
        autoSaveCustomer(phone, customerInfo.name);
      } else {
        // Only phone provided - just check if customer exists
        checkCustomer(phone);
      }
    }, 500);

    setCheckTimeout(timeout);
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

  // Listen to real-time customer discount updates via Socket.io
  useEffect(() => {
    const cleanup = subscribeToCustomerDiscount((data) => {
      // Normalize phone numbers for comparison (remove spaces, dashes, etc.)
      const normalizePhone = (phone: string) => phone.trim().replace(/[\s\-\(\)]/g, '');
      const currentPhone = normalizePhone(customerInfo.phone);
      const eventPhone = normalizePhone(data.phone);

      // Only update if phone numbers match
      if (currentPhone && eventPhone && currentPhone === eventPhone) {
        console.log('📡 Real-time discount update received (Customer):', {
          phone: data.phone,
          membershipLevel: data.customer.membershipLevel,
          discountRate: data.discountRate,
        });
        
        // Update discount rate
        setDiscountRate(data.discountRate);
        if (onDiscountRateChange) {
          onDiscountRateChange(data.discountRate);
        }
        
        // Auto-fill customer name (always update, not just when empty)
        if (data.customer.name) {
          const event = {
            target: { name: 'name', value: data.customer.name },
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(event);
        }
      }
    });

    return cleanup;
  }, [customerInfo.phone, onInputChange, onDiscountRateChange]);

  useEffect(() => {
    return () => {
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
    };
  }, [checkTimeout]);

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

