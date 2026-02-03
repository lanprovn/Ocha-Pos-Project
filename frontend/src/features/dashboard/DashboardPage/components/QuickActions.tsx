import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

interface QuickActionsProps {
  onRefresh: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onRefresh }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-8 bg-white rounded-md shadow-sm border border-gray-300 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao Tác Nhanh</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-4 bg-slate-700 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Bán Hàng</span>
        </button>
        <button
          onClick={() => navigate('/checkout')}
          className="p-4 bg-slate-700 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Thanh Toán</span>
        </button>
        <button
          onClick={() => navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=stock`)}
          className="p-4 bg-slate-700 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Tồn Kho</span>
        </button>
        <button
          onClick={onRefresh}
          className="p-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Làm Mới</span>
        </button>
      </div>
    </div>
  );
};

