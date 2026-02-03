"use client";
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import customerService from '@features/customers/services/customer.service';
import toast from 'react-hot-toast';
import type { Customer, CustomerDetail } from '@/types/customer';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: CustomerDetail) => void;
  initialCustomer?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCustomer,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialCustomer) {
        setFormData({
          name: initialCustomer.name || '',
          phone: initialCustomer.phone || '',
          email: initialCustomer.email || '',
          address: initialCustomer.address || '',
          notes: initialCustomer.notes || '',
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          notes: '',
        });
      }
    }
  }, [isOpen, initialCustomer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Vui lòng nhập tên và số điện thoại');
      return;
    }

    setIsSubmitting(true);
    try {
      let customer: CustomerDetail;
      if (initialCustomer) {
        // Update existing customer
        customer = await customerService.updateLimited(initialCustomer.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          notes: formData.notes.trim() || null,
        });
        toast.success('Cập nhật khách hàng thành công');
      } else {
        // Create new customer
        customer = await customerService.create({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          notes: formData.notes.trim() || null,
        });
        toast.success('Tạo khách hàng thành công');
      }
      onSuccess(customer);
      onClose();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast.error(error?.response?.data?.error || 'Có lỗi xảy ra khi lưu khách hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[80%] bg-white rounded-lg shadow-xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialCustomer ? 'Cập nhật khách hàng' : 'Tạo khách hàng mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nhập họ và tên"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nhập số điện thoại"
                required
                disabled={isSubmitting || !!initialCustomer}
              />
              {initialCustomer && (
                <p className="text-xs text-gray-500 mt-1">Không thể thay đổi số điện thoại</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nhập email (tùy chọn)"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nhập địa chỉ (tùy chọn)"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-800 mb-2">
                Ghi chú
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Ghi chú về khách hàng (tùy chọn)"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim() || !formData.phone.trim()}
            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang lưu...' : initialCustomer ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

