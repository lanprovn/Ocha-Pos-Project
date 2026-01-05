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
          <div>
            <h1 className="text-xl font-bold text-gray-900">Doanh Thu Hàng Ngày</h1>
            <p className="text-sm text-gray-600">
              {formatDate(currentTime)}
            </p>
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
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

