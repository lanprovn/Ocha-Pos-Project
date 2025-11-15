import React, { useState } from 'react';
import toast from 'react-hot-toast';
import type { User, ResetPasswordInput } from '../types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ResetPasswordInput) => Promise<void>;
  user: User | null;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
}) => {
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    try {
      await onSave({
        email: user.email,
        newPassword,
      });
      setNewPassword('');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full my-auto">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Reset Mật Khẩu</h2>
          <p className="text-sm text-gray-500 mt-1">Người dùng: {user.name} ({user.email})</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                placeholder="Tối thiểu 6 ký tự"
              />
              <p className="text-xs text-gray-500 mt-1">Mật khẩu mới phải có ít nhất 6 ký tự</p>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Reset Mật Khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

