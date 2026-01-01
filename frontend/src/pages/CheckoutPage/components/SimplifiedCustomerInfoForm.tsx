import React from 'react';
import { MembershipBadge } from '../../../components/MembershipBadge';
import { formatPrice } from '../../../utils/formatPrice';
import { MEMBERSHIP_DISCOUNT_RATES } from '../../../constants/membership';
import type { CustomerInfo } from '../types';
import type { Customer } from '../../../services/customer.service';

interface SimplifiedCustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  foundCustomer?: Customer | null;
  membershipDiscount?: number;
}

/**
 * SimplifiedCustomerInfoForm - Simplified form for customer self-service
 * Only requires phone and table number
 */
export const SimplifiedCustomerInfoForm: React.FC<SimplifiedCustomerInfoFormProps> = ({
  customerInfo,
  onInputChange,
  foundCustomer,
  membershipDiscount = 0
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Thông tin đơn hàng
      </h2>

      {/* Hiển thị membership badge nếu tìm thấy customer */}
      {foundCustomer && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Xin chào, {foundCustomer.name}!</p>
                <MembershipBadge 
                  level={foundCustomer.membershipLevel} 
                  discount={MEMBERSHIP_DISCOUNT_RATES[foundCustomer.membershipLevel]}
                  className="mt-1"
                />
              </div>
            </div>
            {membershipDiscount > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Giảm giá:</p>
                <p className="text-lg font-bold text-green-600">
                  -{formatPrice(membershipDiscount)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
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
            onChange={onInputChange}
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
          <label htmlFor="table" className="block text-sm font-semibold text-gray-800">
            Số bàn
          </label>
          <input
            type="text"
            id="table"
            name="table"
            value={customerInfo.table}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-lg"
            placeholder="Nhập số bàn (tùy chọn)"
          />
        </div>

        {/* Name field - Auto-filled if customer found, editable */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
            Tên khách hàng {foundCustomer ? <span className="text-green-600 text-xs">(Đã tự động điền)</span> : <span className="text-gray-400 text-xs">(Tùy chọn)</span>}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={onInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-lg ${
              foundCustomer && customerInfo.name 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300'
            }`}
            placeholder={foundCustomer ? foundCustomer.name : "Nhập tên (tùy chọn)"}
            readOnly={foundCustomer && customerInfo.name === foundCustomer.name}
          />
          {foundCustomer && customerInfo.name && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Thông tin khách hàng đã được tự động điền từ hệ thống
            </p>
          )}
        </div>

        {/* Optional: Additional info (hidden by default, can be expanded) */}
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            Thêm thông tin khác (tùy chọn)
          </summary>
          <div className="mt-3 space-y-3 pt-3 border-t border-gray-200">
            
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-800">
                Ghi chú
              </label>
              <textarea
                id="notes"
                name="notes"
                value={customerInfo.notes}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
                rows={2}
                placeholder="Ghi chú đặc biệt (tùy chọn)"
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

