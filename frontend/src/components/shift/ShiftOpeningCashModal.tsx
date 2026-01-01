import React, { useState } from 'react';
import { ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { shiftService } from '../../services/shift.service';

interface ShiftOpeningCashModalProps {
  isOpen: boolean;
  userName: string;
  onSuccess: () => void;
}

/**
 * ShiftOpeningCashModal - Modal để nhân viên nhập tiền bàn giao ca khi đăng nhập
 * Giống như các hệ thống POS thực tế
 */
const ShiftOpeningCashModal: React.FC<ShiftOpeningCashModalProps> = ({
  isOpen,
  userName,
  onSuccess,
}) => {
  const [openingCash, setOpeningCash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!openingCash || parseFloat(openingCash) < 0) {
      setError('Số tiền bàn giao ca phải lớn hơn hoặc bằng 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await shiftService.autoOpen({
        openingCash: parseFloat(openingCash),
        notes: `Ca tự động mở khi nhân viên ${userName} đăng nhập - Tiền bàn giao: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(openingCash))}`,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Không thể mở ca làm việc. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      await shiftService.autoOpen({
        openingCash: 0,
        notes: `Ca tự động mở khi nhân viên ${userName} đăng nhập - Không có tiền bàn giao`,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Không thể mở ca làm việc. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[65vw] max-w-4xl min-w-[600px]">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bàn Giao Ca Làm Việc</h3>
              <p className="text-sm text-slate-500">Chào mừng {userName}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Vui lòng nhập số tiền bàn giao ca</strong> để bắt đầu ca làm việc của bạn.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số Tiền Bàn Giao Ca <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={openingCash}
                onChange={(e) => {
                  setOpeningCash(e.target.value);
                  setError(null);
                }}
                min="0"
                step="1000"
                required
                autoFocus
                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập số tiền bàn giao ca (VND)"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                VND
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Số tiền này sẽ được hiển thị cho Quản trị viên để theo dõi
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
            >
              Bỏ qua (Tiền = 0)
            </button>
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || !openingCash}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-4 h-4" />
                    <span>Bắt Đầu Ca Làm Việc</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftOpeningCashModal;

