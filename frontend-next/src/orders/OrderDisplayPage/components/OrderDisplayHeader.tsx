"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import HomeButton from '@components/ui/HomeButton';

interface OrderDisplayHeaderProps {
  currentTime: Date;
}

export const OrderDisplayHeader: React.FC<OrderDisplayHeaderProps> = ({ currentTime }) => {
  const navigate = useRouter();

  return (
    <div className="bg-white rounded-md shadow-sm p-3 border border-gray-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            Hiển Thị Đơn Hàng
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right mr-2">
            <div className="text-xs text-gray-500">Thời gian</div>
            <div className="text-sm font-bold text-blue-600 font-mono">
              {currentTime.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
          <HomeButton size="sm" />
        </div>
      </div>
    </div>
  );
};

