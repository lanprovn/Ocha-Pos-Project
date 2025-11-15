import React, { useState, useEffect } from 'react';
import dashboardService from '@services/dashboard.service';
import { orderService } from '@services/order.service';
import { formatPrice } from '../../../utils/formatPrice';
import toast from 'react-hot-toast';

interface RevenueSummaryData {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  paymentBreakdown: Record<string, { revenue: number; orders: number }>;
}

export const RevenueSummary: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [summary, setSummary] = useState<RevenueSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getRevenueSummary(
        period,
        useCustomRange && customStartDate ? customStartDate : undefined,
        useCustomRange && customEndDate ? customEndDate : undefined
      );
      setSummary(data as any);
    } catch (error: any) {
      console.error('Error loading revenue summary:', error);
      toast.error(error?.message || 'Không thể tải dữ liệu tổng hợp');
      setSummary(null); // Ensure summary is set to null on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!useCustomRange || (customStartDate && customEndDate)) {
      loadSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, useCustomRange, customStartDate, customEndDate]);

  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month') => {
    setPeriod(newPeriod);
    setUseCustomRange(false);
  };

  const handleCustomRangeSubmit = () => {
    if (!customStartDate || !customEndDate) {
      toast.error('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc');
      return;
    }
    if (new Date(customStartDate) > new Date(customEndDate)) {
      toast.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      return;
    }
    loadSummary();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleExportOrders = async () => {
    if (!summary) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }

    setIsExporting(true);
    try {
      // Prepare filters based on current period/range
      const filters: any = {
        paymentStatus: 'SUCCESS', // Only export paid orders
      };

      if (useCustomRange && customStartDate && customEndDate) {
        filters.startDate = customStartDate;
        filters.endDate = customEndDate;
      } else {
        // Use summary date range
        filters.startDate = summary.startDate;
        filters.endDate = summary.endDate;
      }

      const blob = await orderService.exportOrders(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on period
      const periodName = useCustomRange 
        ? `${customStartDate}_${customEndDate}`
        : period === 'day' 
          ? summary.startDate 
          : period === 'week'
            ? `week_${summary.startDate}`
            : `month_${summary.startDate.split('-')[0]}-${summary.startDate.split('-')[1]}`;
      
      link.download = `orders_${periodName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Xuất Excel thành công!');
    } catch (error: any) {
      toast.error(error?.message || 'Không thể xuất Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Tổng Hợp Doanh Thu</h2>
        
        {/* Period Selector and Export Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Export Button */}
          <button
            onClick={handleExportOrders}
            disabled={isExporting || !summary}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            title="Xuất Excel theo kỳ đã chọn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium">{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handlePeriodChange('day')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'day' && !useCustomRange
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'week' && !useCustomRange
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'month' && !useCustomRange
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tháng
            </button>
          </div>

          {/* Custom Date Range */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={useCustomRange}
                onChange={(e) => {
                  setUseCustomRange(e.target.checked);
                  if (e.target.checked) {
                    setPeriod('day');
                  }
                }}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span>Tùy chọn</span>
            </label>
            {useCustomRange && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-500">đến</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleCustomRangeSubmit}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Áp dụng
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      ) : summary && summary.dailyBreakdown ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng Doanh Thu</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.totalRevenue || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.startDate && summary.endDate ? `${formatDate(summary.startDate)} - ${formatDate(summary.endDate)}` : ''}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng Đơn Hàng</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalOrders || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Đơn đã thanh toán</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-sm font-medium text-gray-600 mb-1">Giá Trị Đơn TB</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.averageOrderValue || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Trung bình mỗi đơn</p>
            </div>
          </div>

          {/* Daily Breakdown */}
          {summary.dailyBreakdown && summary.dailyBreakdown.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi Tiết Theo Ngày</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Doanh Thu</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số Đơn</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.dailyBreakdown.map((day: any) => (
                      <tr key={day.date || day} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {day.date ? formatDate(day.date) : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                          {formatPrice(day.revenue || 0)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                          {day.orders || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Method Breakdown */}
          {summary.paymentBreakdown && Object.keys(summary.paymentBreakdown).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theo Phương Thức Thanh Toán</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(summary.paymentBreakdown).map(([method, data]: [string, any]) => (
                  <div key={method} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {method === 'cash' ? '💵 Tiền mặt' : method === 'qr' ? '📱 QR Code' : method}
                    </p>
                    <p className="text-xl font-bold text-gray-900">{formatPrice(data?.revenue || 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">{data?.orders || 0} đơn</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
      )}
    </div>
  );
};

