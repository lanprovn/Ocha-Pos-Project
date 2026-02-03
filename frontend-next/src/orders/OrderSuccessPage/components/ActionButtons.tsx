"use client";
import React from 'react';

interface ActionButtonsProps {
  onNewOrder: () => void;
  onGoHome: () => void;
  orderId?: string;
  orderNumber?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onNewOrder,
  onGoHome,
  orderId,
  orderNumber
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
      <button
        onClick={onNewOrder}
        className="w-full sm:w-auto px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-md transition-colors flex items-center justify-center space-x-2 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Đặt đơn mới</span>
      </button>
      
      <button
        onClick={onGoHome}
        className="w-full sm:w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md transition-colors flex items-center justify-center space-x-2 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Về trang chủ</span>
      </button>
    </div>
  );
};

