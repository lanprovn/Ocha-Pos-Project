import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import type { CustomerDetail } from '@/types/customer';

interface AdjustPointsModalProps {
  customer: CustomerDetail | null;
  isLoading?: boolean;
  onClose: () => void;
  onSave: (points: number, reason: string) => Promise<void>;
}

const AdjustPointsModal: React.FC<AdjustPointsModalProps> = ({
  customer,
  isLoading = false,
  onClose,
  onSave,
}) => {
  const [points, setPoints] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

  useEffect(() => {
    if (customer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [customer]);

  if (!customer) return null;

  const handlePointsChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setPoints(numericValue);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pointsValue = parseInt(points, 10);
    
    if (!points || pointsValue === 0) {
      setError('Vui lòng nhập số điểm khác 0');
      return;
    }

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do điều chỉnh');
      return;
    }

    setIsSaving(true);

    try {
      const finalPoints = adjustmentType === 'add' ? pointsValue : -pointsValue;
      await onSave(finalPoints, reason.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể điều chỉnh điểm tích lũy');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPoints = customer.loyaltyPoints;
  const pointsValue = parseInt(points, 10) || 0;
  const newPoints = adjustmentType === 'add' 
    ? currentPoints + pointsValue 
    : Math.max(0, currentPoints - pointsValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full md:w-[90%] lg:w-[80%] rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Điều chỉnh điểm tích lũy</h2>
            <p className="text-sm text-gray-500 mt-1">{customer.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Current Points Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Điểm tích lũy hiện tại:</span>
                <span className="text-2xl font-bold text-gray-900">{currentPoints.toLocaleString()} điểm</span>
              </div>
            </div>

            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Loại điều chỉnh</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustmentType('add');
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                    adjustmentType === 'add'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="font-medium">Thêm điểm</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdjustmentType('subtract');
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                    adjustmentType === 'subtract'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <MinusIcon className="w-5 h-5" />
                  <span className="font-medium">Trừ điểm</span>
                </button>
              </div>
            </div>

            {/* Points Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điểm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={points}
                onChange={(e) => handlePointsChange(e.target.value)}
                placeholder="Nhập số điểm..."
                required
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {pointsValue > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {adjustmentType === 'add' ? (
                    <span>
                      Điểm sau khi thêm: <span className="font-semibold text-green-600">{newPoints.toLocaleString()} điểm</span>
                    </span>
                  ) : (
                    <span>
                      Điểm sau khi trừ: <span className="font-semibold text-red-600">{newPoints.toLocaleString()} điểm</span>
                      {newPoints === 0 && currentPoints > 0 && (
                        <span className="block text-red-500 mt-1">⚠️ Điểm sẽ về 0</span>
                      )}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do điều chỉnh <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(null);
                }}
                rows={4}
                required
                placeholder="Nhập lý do điều chỉnh điểm tích lũy..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Preview */}
            {pointsValue > 0 && reason.trim() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Xem trước giao dịch:</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <span className="font-medium">Loại:</span> {adjustmentType === 'add' ? 'Thêm điểm' : 'Trừ điểm'}
                  </p>
                  <p>
                    <span className="font-medium">Số điểm:</span> {adjustmentType === 'add' ? '+' : '-'}{pointsValue.toLocaleString()} điểm
                  </p>
                  <p>
                    <span className="font-medium">Lý do:</span> {reason}
                  </p>
                  <p className="pt-2 border-t border-blue-200">
                    <span className="font-medium">Điểm mới:</span>{' '}
                    <span className="text-lg font-bold">{newPoints.toLocaleString()} điểm</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isLoading || !points || !reason.trim()}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              adjustmentType === 'add'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSaving ? 'Đang xử lý...' : adjustmentType === 'add' ? 'Thêm điểm' : 'Trừ điểm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdjustPointsModal;

