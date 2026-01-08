import React, { useState, useCallback, useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useUsers } from '@features/users/hooks/useUsers';
import { useAuth } from '@features/auth/hooks/useAuth';
import UserList from '@features/users/components/UserList';
import UserFormModal from '@features/users/components/UserFormModal';
import type { User, CreateUserInput, UpdateUserInput } from '@/types/user';

const UserManagementTab: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    isLoading,
    error,
    pagination,
    filters,
    createUser,
    updateUser,
    deleteUser,
    toggleActive,
    resetPassword,
    setSearchQuery,
    setRoleFilter,
    setIsActiveFilter,
    setPage,
  } = useUsers({ page: 1, limit: 10 });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const stats = useMemo(() => {
    const totalUsers = pagination.total;
    const activeUsers = users.filter((u) => u.isActive).length;
    const adminUsers = users.filter((u) => u.role === 'ADMIN').length;
    const staffUsers = users.filter((u) => u.role === 'STAFF').length;

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      staffUsers,
    };
  }, [users, pagination.total]);

  const handleCreate = useCallback(
    async (data: CreateUserInput) => {
      await createUser(data);
      setShowCreateModal(false);
    },
    [createUser]
  );

  const handleUpdate = useCallback(
    async (data: UpdateUserInput) => {
      if (!selectedUser) return;
      await updateUser(selectedUser.id, data);
      setShowEditModal(false);
      setSelectedUser(null);
    },
    [selectedUser, updateUser]
  );

  const handleDelete = useCallback(
    async (user: User) => {
      if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}"?`)) {
        await deleteUser(user.id);
        setDeleteConfirm(null);
      }
    },
    [deleteUser]
  );

  const handleToggleActive = useCallback(
    async (user: User) => {
      await toggleActive(user.id);
    },
    [toggleActive]
  );

  const handleResetPassword = useCallback(
    async (user: User, newPassword: string) => {
      await resetPassword(user.id, newPassword);
      setShowResetPasswordModal(false);
      setSelectedUser(null);
    },
    [resetPassword]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng người dùng</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-lg border-l-4 border-emerald-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-emerald-700 mb-3 font-medium uppercase tracking-wide">Đang hoạt động</p>
          <p className="text-2xl font-bold text-emerald-900">{stats.activeUsers}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-100/50 rounded-lg border-l-4 border-purple-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-purple-700 mb-3 font-medium uppercase tracking-wide">Quản trị viên</p>
          <p className="text-2xl font-bold text-purple-900">{stats.adminUsers}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100/50 rounded-lg border-l-4 border-amber-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-amber-700 mb-3 font-medium uppercase tracking-wide">Nhân viên</p>
          <p className="text-2xl font-bold text-amber-900">{stats.staffUsers}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={filters.search || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filters.role || ''}
              onChange={(e) => setRoleFilter(e.target.value as 'ADMIN' | 'STAFF' | undefined || undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="STAFF">Nhân viên</option>
            </select>
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) =>
                setIsActiveFilter(
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã vô hiệu hóa</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Tạo mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* User List */}
      <UserList
        users={users}
        isLoading={isLoading}
        onViewDetail={(user) => {
          setSelectedUser(user);
          setShowEditModal(true);
        }}
        onEdit={(user) => {
          setSelectedUser(user);
          setShowEditModal(true);
        }}
        onDelete={handleDelete}
        onResetPassword={(user) => {
          setSelectedUser(user);
          setShowResetPasswordModal(true);
        }}
        currentUserId={currentUser?.id}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{users.length}</span> trong tổng số{' '}
            <span className="font-medium">{pagination.total}</span> người dùng
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <UserFormModal
        isOpen={showCreateModal}
        isLoading={isLoading}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Modal */}
      <UserFormModal
        user={selectedUser}
        isOpen={showEditModal}
        isLoading={isLoading}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdate}
      />

      {/* Reset Password Modal - Simple version */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Đặt lại mật khẩu cho {selectedUser.name}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newPassword = formData.get('password') as string;
                  if (newPassword && newPassword.length >= 6) {
                    handleResetPassword(selectedUser, newPassword);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Đặt lại
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTab;
