import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ReportingHeaderProps {
  currentTime: Date;
}

export const ReportingHeader: React.FC<ReportingHeaderProps> = ({ currentTime }) => {
  const navigate = useNavigate();

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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <span>📈</span>
                <span>Báo Cáo & Thống Kê</span>
              </h1>
              <p className="text-sm text-gray-600">
                Phân tích chi tiết doanh thu và hiệu suất kinh doanh
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
          </div>
        </div>
      </div>
    </div>
  );
};

