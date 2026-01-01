import React from 'react';
import { MembershipBadge } from '../../../components/MembershipBadge';
import { formatPrice } from '../../../utils/formatPrice';
import { MEMBERSHIP_DISCOUNT_RATES } from '../../../constants/membership';
import type { CustomerInfo } from '../types';
import type { Customer } from '../../../services/customer.service';

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  foundCustomer?: Customer | null;
  membershipDiscount?: number;
}

export const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  onInputChange,
  foundCustomer,
  membershipDiscount = 0
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin khách hàng</h2>

      {/* Hiển thị membership badge nếu tìm thấy customer */}
      {foundCustomer && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Khách hàng thành viên</p>
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
                <p className="text-xl font-bold text-green-600">
                  -{formatPrice(membershipDiscount)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-800">
            Số điện thoại *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
            placeholder="Nhập số điện thoại (VD: 0912345678)"
            required
            pattern="[0-9]{10,11}"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
            placeholder="Nhập số bàn (tùy chọn)"
          />
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

