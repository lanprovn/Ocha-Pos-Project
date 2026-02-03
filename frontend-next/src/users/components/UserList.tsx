import React from 'react';
import { EyeIcon, PencilIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';
import type { User } from '@/types/user';

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onViewDetail: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
  currentUserId?: string;
}

const roleColors: Record<'ADMIN' | 'STAFF', string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  STAFF: 'bg-blue-100 text-blue-800',
};

const roleLabels: Record<'ADMIN' | 'STAFF', string> = {
  ADMIN: 'Quản trị viên',
  STAFF: 'Nhân viên',
};

const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  onViewDetail,
  onEdit,
  onDelete,
  onResetPassword,
  currentUserId,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có người dùng nào</h3>
        <p className="text-gray-500">Không tìm thấy người dùng nào phù hợp với bộ lọc</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      roleColors[user.role]
                    }`}
                  >
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onViewDetail(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onResetPassword(user)}
                      className="text-amber-600 hover:text-amber-900 transition-colors"
                      title="Đặt lại mật khẩu"
                    >
                      <KeyIcon className="h-5 w-5" />
                    </button>
                    {user.id !== currentUserId && (
                      <button
                        onClick={() => onDelete(user)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Xóa"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
