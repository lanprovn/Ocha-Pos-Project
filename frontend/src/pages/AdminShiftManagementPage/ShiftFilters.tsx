import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import type { ShiftFilters as ShiftFiltersType, ShiftStatus } from '../../types/shift';

interface ShiftFiltersProps {
  filters: ShiftFiltersType;
  onFiltersChange: (filters: ShiftFiltersType) => void;
}

const ShiftFilters: React.FC<ShiftFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleChange = (key: keyof ShiftFiltersType, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.status || filters.startDate || filters.endDate || filters.userId;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Bộ Lọc</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xóa Bộ Lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Trạng Thái</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value as ShiftStatus | '')}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất Cả</option>
            <option value="OPEN">Đang Mở</option>
            <option value="CLOSED">Đã Đóng</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Từ Ngày</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Đến Ngày</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Nhân Viên ID</label>
          <input
            type="text"
            value={filters.userId || ''}
            onChange={(e) => handleChange('userId', e.target.value)}
            placeholder="Nhập ID nhân viên"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ShiftFilters;



