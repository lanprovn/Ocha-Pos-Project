import React from 'react';
import { ClockIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { Shift } from '../../types/shift';
import { formatPrice } from '../../utils/formatPrice';

interface ShiftTableProps {
  shifts: Shift[];
  isLoading: boolean;
  onView: (shift: Shift) => void;
  onClose?: (shift: Shift) => void;
  onUpdate?: (shift: Shift) => void;
  onDelete?: (id: string) => void;
}

const ShiftTable: React.FC<ShiftTableProps> = ({
  shifts,
  isLoading,
  onView,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    if (status === 'OPEN') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          Đang Mở
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
        Đã Đóng
      </span>
    );
  };

  const calculateDuration = (startTime: string, endTime?: string | null) => {
    if (!endTime) return '-';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Mã Ca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nhân Viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Thời Gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tiền Mở Ca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tiền Đóng Ca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Chênh Lệch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : shifts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  <ClockIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-sm">Chưa có ca làm việc nào</p>
                </td>
              </tr>
            ) : (
              shifts.map((shift) => {
                const variance = shift.variance ? parseFloat(shift.variance) : null;
                const varianceColor = variance === null ? '' : variance >= 0 ? 'text-green-600' : 'text-red-600';

                return (
                  <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{shift.shiftNumber}</div>
                      <div className="text-xs text-slate-500">{formatDate(shift.startTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{shift.userName}</div>
                      <div className="text-xs text-slate-500">ID: {shift.userId.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        <div>Bắt đầu: {formatDateTime(shift.startTime)}</div>
                        {shift.endTime && (
                          <div className="text-xs text-slate-500 mt-1">
                            Kết thúc: {formatDateTime(shift.endTime)}
                          </div>
                        )}
                        {shift.endTime && (
                          <div className="text-xs text-blue-600 mt-1">
                            Thời lượng: {calculateDuration(shift.startTime, shift.endTime)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {formatPrice(parseFloat(shift.openingCash))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {shift.closingCash ? formatPrice(parseFloat(shift.closingCash)) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${varianceColor}`}>
                        {variance !== null ? formatPrice(variance) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(shift.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onView(shift)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {shift.status === 'OPEN' && onClose && (
                          <button
                            onClick={() => onClose(shift)}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Đóng ca"
                          >
                            <ClockIcon className="w-5 h-5" />
                          </button>
                        )}
                        {onUpdate && (
                          <button
                            onClick={() => onUpdate(shift)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(shift.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Xóa"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftTable;



