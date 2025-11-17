import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dashboardFormatters';
import { resetDailyData } from '../utils/dashboardCalculations';
import toast from 'react-hot-toast';

interface DashboardHeaderProps {
  currentTime: Date;
  isConnected: boolean;
  onReset: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentTime,
  isConnected,
  onReset
}) => {
  const navigate = useNavigate();

  const handleReset = () => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn reset dữ liệu hôm nay?\n\n' +
      'Hành động này không thể hoàn tác!'
    );
    
    if (!confirmed) return;
    
    resetDailyData();
    onReset();
    toast.success('Đã reset dữ liệu hôm nay', {
      duration: 2000,
      position: 'top-right',
    });
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doanh Thu Hàng Ngày</h1>
              <p className="text-sm text-gray-600">
                {formatDate(currentTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Thời gian hiện tại</p>
              <p className="text-lg font-mono font-semibold text-slate-700">
                {currentTime.toLocaleTimeString('vi-VN')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}></div>
              <span className="text-xs text-gray-600">Real-time</span>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

