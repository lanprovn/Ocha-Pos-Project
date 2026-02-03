"use client";
import React from 'react';
import type { ReportFilters } from '@features/reporting/services/reporting.service';

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: Partial<ReportFilters>) => void;
  onExport: () => void;
  isLoading: boolean;
}

export const ReportFiltersComponent: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  isLoading,
}) => {
  const handleReportTypeChange = (type: string) => {
    const today = new Date();
    let startDate = new Date();
    
    switch (type) {
      case 'daily':
        // Today only
        startDate = new Date(today);
        break;
      case 'weekly':
        // Last 7 days
        startDate.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        // Last 30 days
        startDate.setDate(today.getDate() - 30);
        break;
      case 'custom':
      default:
        // Keep current dates
        return;
    }
    
    onFiltersChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      reportType: type as ReportFilters['reportType'],
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại báo cáo
          </label>
          <select
            value={filters.reportType || 'custom'}
            onChange={(e) => handleReportTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            disabled={isLoading}
          >
            <option value="daily">Hôm nay</option>
            <option value="weekly">7 ngày qua</option>
            <option value="monthly">30 ngày qua</option>
            <option value="custom">Tùy chọn</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Từ ngày
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFiltersChange({ startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            disabled={isLoading || filters.reportType !== 'custom'}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đến ngày
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFiltersChange({ endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            disabled={isLoading || filters.reportType !== 'custom'}
          />
        </div>

        {/* Export Button */}
        <div className="flex items-end">
          <button
            onClick={onExport}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>📥 Xuất Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

