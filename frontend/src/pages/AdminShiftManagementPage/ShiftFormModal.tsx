import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Shift, CreateShiftInput, CloseShiftInput, UpdateShiftInput } from '../../types/shift';
import { useAuth } from '../../hooks/useAuth';

interface ShiftFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'close' | 'update';
  shift?: Shift | null;
  onClose: () => void;
  onSuccess: () => void;
  onCreate: (data: CreateShiftInput) => Promise<Shift | null>;
  onCloseShift: (id: string, data: CloseShiftInput) => Promise<Shift | null>;
  onUpdate: (id: string, data: UpdateShiftInput) => Promise<Shift | null>;
}

const ShiftFormModal: React.FC<ShiftFormModalProps> = ({
  isOpen,
  mode,
  shift,
  onClose,
  onSuccess,
  onCreate,
  onCloseShift,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    openingCash: '',
    closingCash: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'update' && shift) {
        setFormData({
          openingCash: '',
          closingCash: '',
          notes: shift.notes || '',
        });
      } else if (mode === 'close' && shift) {
        setFormData({
          openingCash: '',
          closingCash: '',
          notes: '',
        });
      } else {
        setFormData({
          openingCash: '',
          closingCash: '',
          notes: '',
        });
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, mode, shift]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (mode === 'create') {
      if (!formData.openingCash || parseFloat(formData.openingCash) < 0) {
        setError('Tiền mở ca phải lớn hơn hoặc bằng 0');
        return;
      }
      if (!user) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      try {
        setIsSubmitting(true);
        const createData: CreateShiftInput = {
          userId: user.id,
          userName: user.name,
          openingCash: parseFloat(formData.openingCash),
          notes: formData.notes || null,
        };
        await onCreate(createData);
        onSuccess();
      } catch (err: any) {
        setError(err.message || 'Không thể mở ca làm việc');
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'close') {
      if (!formData.closingCash || parseFloat(formData.closingCash) < 0) {
        setError('Tiền đóng ca phải lớn hơn hoặc bằng 0');
        return;
      }
      if (!shift) {
        setError('Không tìm thấy ca làm việc');
        return;
      }

      try {
        setIsSubmitting(true);
        const closeData: CloseShiftInput = {
          closingCash: parseFloat(formData.closingCash),
          notes: formData.notes || null,
        };
        await onCloseShift(shift.id, closeData);
        onSuccess();
      } catch (err: any) {
        setError(err.message || 'Không thể đóng ca làm việc');
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'update') {
      if (!shift) {
        setError('Không tìm thấy ca làm việc');
        return;
      }

      try {
        setIsSubmitting(true);
        const updateData: UpdateShiftInput = {
          notes: formData.notes || null,
        };
        await onUpdate(shift.id, updateData);
        onSuccess();
      } catch (err: any) {
        setError(err.message || 'Không thể cập nhật ca làm việc');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getTitle = () => {
    if (mode === 'create') return 'Mở Ca Làm Việc';
    if (mode === 'close') return 'Đóng Ca Làm Việc';
    return 'Chỉnh Sửa Ca Làm Việc';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[65vw] max-w-4xl min-w-[600px]">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-bold text-slate-900">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'create' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nhân Viên
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tiền Mở Ca <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="openingCash"
                  value={formData.openingCash}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số tiền mở ca"
                />
              </div>
            </>
          )}

          {mode === 'close' && shift && (
            <>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Tiền Mở Ca:</p>
                    <p className="font-semibold text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        parseFloat(shift.openingCash)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Tiền Dự Kiến:</p>
                    <p className="font-semibold text-slate-900">
                      {shift.expectedCash
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            parseFloat(shift.expectedCash)
                          )
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tiền Đóng Ca <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="closingCash"
                  value={formData.closingCash}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số tiền đóng ca"
                />
              </div>
            </>
          )}

          {mode === 'update' && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">
                <strong>Mã Ca:</strong> {shift?.shiftNumber}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                <strong>Nhân Viên:</strong> {shift?.userName}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ghi Chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập ghi chú (tùy chọn)"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                mode === 'close'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting
                ? 'Đang xử lý...'
                : mode === 'create'
                ? 'Mở Ca'
                : mode === 'close'
                ? 'Đóng Ca'
                : 'Cập Nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftFormModal;

