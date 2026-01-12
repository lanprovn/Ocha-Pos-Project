import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import customerService from '@features/customers/services/customer.service';
import type { CustomerInfo } from '../types';
import type { Customer, MembershipLevel } from '@/types/customer';

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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

export const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  onInputChange,
  onCustomerFound,
  onDiscountRateChange,
}) => {
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [newlyCreatedCustomer, setNewlyCreatedCustomer] = useState<Customer | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const checkCustomer = useCallback(async (phone: string) => {
    if (!phone || phone.length < 10) {
      setFoundCustomer(null);
      setNewlyCreatedCustomer(null);
      setDiscountRate(0);
      if (onDiscountRateChange) {
        onDiscountRateChange(0);
      }
      return;
    }

    setIsChecking(true);
    try {
      const result = await customerService.findByPhone(phone);
      // Clear newly created customer state when checking
      setNewlyCreatedCustomer(null);
      
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
      setNewlyCreatedCustomer(null);
    } finally {
      setIsChecking(false);
    }
  }, [customerInfo.name, onCustomerFound, onInputChange, onDiscountRateChange]);

  // Auto-save customer when both phone and name are provided
  // Show different messages for existing vs newly created customers
  const autoSaveCustomer = useCallback(async (phone: string, name: string) => {
    if (!phone || phone.length < 10 || !name || name.trim().length === 0) {
      return;
    }

    try {
      const result = await customerService.findOrCreateByPhone(phone, name.trim());
      if (result.customer) {
        // Clear previous states
        setFoundCustomer(null);
        setNewlyCreatedCustomer(null);
        
        if (result.exists) {
          // Customer already existed - show "existing customer" message
          setFoundCustomer(result.customer);
        } else if (result.created) {
          // New customer created - show "newly created" message
          setNewlyCreatedCustomer(result.customer);
        }
        
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

    // Clear newly created customer state when phone changes
    setNewlyCreatedCustomer(null);

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
        // This will create new customer if not exists, or update existing one
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

    // Clear newly created customer state when name changes
    setNewlyCreatedCustomer(null);

    // Auto-save if both phone and name are provided
    if (customerInfo.phone && customerInfo.phone.length >= 10 && name && name.trim().length > 0) {
      // Debounce auto-save
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
      const timeout = setTimeout(() => {
        autoSaveCustomer(customerInfo.phone, name);
      }, 500);
      setCheckTimeout(timeout);
    }
  };

  useEffect(() => {
    return () => {
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
    };
  }, [checkTimeout]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin khách hàng</h2>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
            Họ và tên *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleNameChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-800">
            Số điện thoại *
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                foundCustomer || newlyCreatedCustomer ? 'border-green-300 bg-green-50' : 'border-gray-300'
              }`}
              placeholder="Nhập số điện thoại (VD: 0912345678)"
              required
              pattern="[0-9]{10,11}"
            />
            {isChecking && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
            {(foundCustomer || newlyCreatedCustomer) && !isChecking && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Ví dụ: 0912345678 hoặc 0123456789
          </p>
          
          {/* Existing Customer Message */}
          {foundCustomer && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
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
                    <span className="text-gray-600">
                      Tổng chi tiêu: <span className="font-semibold">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          minimumFractionDigits: 0,
                        }).format(foundCustomer.totalSpent)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Newly Created Customer Message */}
          {newlyCreatedCustomer && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Khách hàng đã được tạo thành viên
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded-full font-medium ${
                        membershipLevelColors[newlyCreatedCustomer.membershipLevel] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {membershipLevelLabels[newlyCreatedCustomer.membershipLevel] || newlyCreatedCustomer.membershipLevel}
                    </span>
                    {discountRate > 0 && (
                      <span className="px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                        Giảm {discountRate}%
                      </span>
                    )}
                    <span className="text-gray-600">
                      Điểm tích lũy: <span className="font-semibold">{newlyCreatedCustomer.loyaltyPoints.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-800">
            Ghi chú đặc biệt
          </label>
          <textarea
            id="notes"
            name="notes"
            value={customerInfo.notes}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
            rows={3}
            placeholder="Ghi chú đặc biệt cho đơn hàng"
          />
        </div>
      </div>
    </div>
  );
};

