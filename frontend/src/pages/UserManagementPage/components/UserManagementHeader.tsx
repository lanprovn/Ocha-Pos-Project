import React from 'react';
import { useNavigate } from 'react-router-dom';

interface UserManagementHeaderProps {
  onCreateUser: () => void;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ onCreateUser }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
              <p className="text-sm text-gray-500">
                Quản lý nhân viên và quyền truy cập hệ thống
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onCreateUser}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Tạo Người Dùng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

