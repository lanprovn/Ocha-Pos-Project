import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { ShiftSummary } from '../../types/shift';
import { formatPrice } from '../../utils/formatPrice';

interface ShiftSummaryCardProps {
  shiftId: string;
  onClose: () => void;
  getSummary: (id: string) => Promise<ShiftSummary | null>;
}

const ShiftSummaryCard: React.FC<ShiftSummaryCardProps> = ({ shiftId, onClose, getSummary }) => {
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      setIsLoading(true);
      const data = await getSummary(shiftId);
      setSummary(data);
      setIsLoading(false);
    };
    loadSummary();
  }, [shiftId, getSummary]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
          <div className="text-center py-12">
            <p className="text-slate-600">Không thể tải tổng kết ca làm việc</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { shift, totalOrders, totalRevenue, cashRevenue, cardRevenue, qrRevenue, totalTransactions } = summary;
  const variance = shift.variance ? parseFloat(shift.variance) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Tổng Kết Ca Làm Việc</h3>
            <p className="text-sm text-slate-500 mt-1">{shift.shiftNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Shift Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Thông Tin Ca</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Nhân Viên:</p>
                <p className="font-medium text-slate-900">{shift.userName}</p>
              </div>
              <div>
                <p className="text-slate-500">Trạng Thái:</p>
                <p className="font-medium text-slate-900">
                  {shift.status === 'OPEN' ? 'Đang Mở' : 'Đã Đóng'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Bắt Đầu:</p>
                <p className="font-medium text-slate-900">
                  {new Date(shift.startTime).toLocaleString('vi-VN')}
                </p>
              </div>
              {shift.endTime && (
                <div>
                  <p className="text-slate-500">Kết Thúc:</p>
                  <p className="font-medium text-slate-900">
                    {new Date(shift.endTime).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cash Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Tiền Mở Ca</p>
              <p className="text-xl font-bold text-blue-900">
                {formatPrice(parseFloat(shift.openingCash))}
              </p>
            </div>
            {shift.closingCash && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 mb-1">Tiền Đóng Ca</p>
                <p className="text-xl font-bold text-green-900">
                  {formatPrice(parseFloat(shift.closingCash))}
                </p>
              </div>
            )}
            {variance !== null && (
              <div className={`rounded-lg p-4 border ${
                variance >= 0 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm mb-1 ${
                  variance >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  Chênh Lệch
                </p>
                <p className={`text-xl font-bold ${
                  variance >= 0 ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  {formatPrice(variance)}
                </p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Thống Kê
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">Tổng Đơn Hàng</p>
                <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">Tổng Doanh Thu</p>
                <p className="text-2xl font-bold text-emerald-600">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">Tổng Giao Dịch</p>
                <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Phương Thức Thanh Toán</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 mb-1">Tiền Mặt</p>
                <p className="text-xl font-bold text-green-900">{formatPrice(cashRevenue)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 mb-1">Thẻ</p>
                <p className="text-xl font-bold text-blue-900">{formatPrice(cardRevenue)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-700 mb-1">QR Code</p>
                <p className="text-xl font-bold text-purple-900">{formatPrice(qrRevenue)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {shift.notes && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Ghi Chú</h4>
              <p className="text-sm text-slate-600">{shift.notes}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftSummaryCard;



