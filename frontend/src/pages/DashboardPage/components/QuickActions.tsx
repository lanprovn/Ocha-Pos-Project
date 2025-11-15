import React from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onRefresh: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onRefresh }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao Tác Nhanh</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2"
        >
          🛒
          <span>Bán Hàng</span>
        </button>
        <button
          onClick={() => navigate('/checkout')}
          className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
        >
          💰
          <span>Thanh Toán</span>
        </button>
        <button
          onClick={() => navigate('/stock-management')}
          className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
        >
          📦
          <span>Tồn Kho</span>
        </button>
        <button
          onClick={() => navigate('/users')}
          className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
        >
          👥
          <span>Người Dùng</span>
        </button>
        <button
          onClick={onRefresh}
          className="p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
        >
          🔄
          <span>Làm Mới</span>
        </button>
      </div>
    </div>
  );
};

