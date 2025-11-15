import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '@services/order.service';
import toast from 'react-hot-toast';

interface OrderDisplayHeaderProps {
  currentTime: Date;
}

export const OrderDisplayHeader: React.FC<OrderDisplayHeaderProps> = ({ currentTime }) => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportOrders = async () => {
    setIsExporting(true);
    try {
      const blob = await orderService.exportOrders();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Đã xuất file CSV thành công');
    } catch (error: any) {
      toast.error(error?.message || 'Không thể xuất file');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
              📋 Hiển Thị Đơn Hàng
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 active:scale-95"
                title="Tạo đơn mới"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Tạo Đơn Mới</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 active:scale-95"
                title="Doanh thu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Doanh Thu</span>
              </button>
              <button
                onClick={handleExportOrders}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Xuất Excel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
              </button>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Theo dõi các đơn hàng đang được tạo và xử lý real-time
          </p>
        </div>
        <div className="text-left sm:text-right bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 py-3 sm:px-6 sm:py-4 border border-blue-200">
          <div className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">Thời gian hiện tại</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 font-mono">
            {currentTime.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

