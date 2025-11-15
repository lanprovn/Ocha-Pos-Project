import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { User, CreateUserInput, UpdateUserInput } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  editingUser: User | null;
  mode: 'create' | 'edit';
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingUser,
  mode,
}) => {
  const [formData, setFormData] = useState<CreateUserInput | UpdateUserInput>({
    email: '',
    name: '',
    role: 'STAFF',
    ...(mode === 'create' && { password: '' }),
    ...(mode === 'edit' && { isActive: true }),
  });

  useEffect(() => {
    if (editingUser && mode === 'edit') {
      setFormData({
        email: editingUser.email,
        name: editingUser.name,
        role: editingUser.role,
        isActive: editingUser.isActive,
      });
    } else {
      setFormData({
        email: '',
        name: '',
        role: 'STAFF',
        ...(mode === 'create' && { password: '' }),
        ...(mode === 'edit' && { isActive: true }),
      });
    }
  }, [editingUser, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden flex flex-col">
        <div className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Tạo Người Dùng Mới' : 'Cập Nhật Người Dùng'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                aria-label="Đóng"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                placeholder="Nhập tên người dùng"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                placeholder="example@email.com"
              />
            </div>
            {mode === 'create' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={(formData as CreateUserInput).password || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value } as CreateUserInput)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role || 'STAFF'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'ADMIN' | 'STAFF',
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
              >
                <option value="STAFF">Nhân viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
            {mode === 'edit' && (
              <div className="flex items-center pt-8">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData as UpdateUserInput).isActive ?? true}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.checked,
                      } as UpdateUserInput)
                    }
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tài khoản đang hoạt động</span>
                </label>
              </div>
            )}
          </div>
            <div className="mt-8 flex items-center justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                {mode === 'create' ? 'Tạo Người Dùng' : 'Cập Nhật'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

