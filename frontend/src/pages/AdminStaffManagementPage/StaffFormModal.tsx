import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { staffService, type CreateStaffInput, type UpdateStaffInput, type Staff } from '../../services/staff.service';
import toast from 'react-hot-toast';

interface StaffFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  staff?: Staff | null;
  onClose: () => void;
  onSuccess: () => void;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  mode,
  staff,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF' as 'ADMIN' | 'STAFF',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && staff) {
        setFormData({
          name: staff.name,
          email: staff.email,
          password: '', // Don't pre-fill password
          role: staff.role,
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'STAFF',
        });
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, mode, staff]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Tên nhân viên không được để trống');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email không được để trống');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email không hợp lệ');
      return;
    }
    if (mode === 'create' && !formData.password) {
      setError('Mật khẩu không được để trống');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        const createData: CreateStaffInput = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
        };
        await staffService.create(createData);
        toast.success('Đã thêm nhân viên thành công');
      } else {
        const updateData: UpdateStaffInput = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
        };
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        await staffService.update(staff!.id, updateData);
        toast.success('Đã cập nhật nhân viên thành công');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Có lỗi xảy ra';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[70vw] mx-auto transform animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              {mode === 'create' ? 'Thêm Nhân Viên Mới' : 'Cập Nhật Nhân Viên'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-600 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Form Grid - 2 columns on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên nhân viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nhập tên nhân viên"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="email@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Mật khẩu {mode === 'create' && <span className="text-red-500">*</span>}
                  {mode === 'edit' && <span className="text-slate-400 text-xs font-normal ml-2">(để trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={mode === 'create' ? 'Nhập mật khẩu (tối thiểu 6 ký tự)' : 'Nhập mật khẩu mới (nếu muốn đổi)'}
                  required={mode === 'create'}
                  minLength={mode === 'create' ? 6 : undefined}
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  required
                >
                  <option value="STAFF">Nhân Viên</option>
                  <option value="ADMIN">Quản Trị Viên</option>
                </select>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Lưu ý:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Tất cả các trường có dấu <span className="text-red-500">*</span> là bắt buộc</li>
                    <li>• Mật khẩu phải có ít nhất 6 ký tự</li>
                    <li>• Email phải đúng định dạng và chưa được sử dụng</li>
                    {mode === 'edit' && <li>• Để trống mật khẩu nếu không muốn thay đổi</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-semibold shadow-sm"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : mode === 'create' ? 'Thêm Nhân Viên' : 'Cập Nhật'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default StaffFormModal;

