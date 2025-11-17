import React from 'react';
import { useNavigate } from 'react-router-dom';

interface OrderDisplayHeaderProps {
  currentTime: Date;
}

export const OrderDisplayHeader: React.FC<OrderDisplayHeaderProps> = ({ currentTime }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 border border-gray-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center space-x-2">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Hiển Thị Đơn Hàng</span>
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-md transition-colors"
                title="Tạo đơn mới"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Tạo Đơn Mới</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-md transition-colors"
                title="Doanh thu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Doanh Thu</span>
              </button>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Theo dõi các đơn hàng đang được tạo và xử lý real-time
          </p>
        </div>
        <div className="text-left sm:text-right bg-gray-50 rounded-md px-4 py-3 sm:px-6 sm:py-4 border border-gray-300">
          <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Thời gian hiện tại</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700 font-mono">
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

