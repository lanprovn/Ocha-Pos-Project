import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@hooks/useAuth';
import userService from '@services/user.service';
import { useUserManagement } from './hooks/useUserManagement';
import { UserManagementHeader } from './components/UserManagementHeader';
import { UserTable } from './components/UserTable';
import { UserFormModal } from './components/UserFormModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import type { User, CreateUserInput, UpdateUserInput, ChangePasswordInput, ResetPasswordInput } from './types';

const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, isLoading, reloadUsers } = useUserManagement();

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null);

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}"?`)) {
      return;
    }

    try {
      await userService.delete(user.id);
      toast.success('Đã xóa người dùng thành công');
      reloadUsers();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể xóa người dùng');
    }
  };

  const handleChangePassword = (user: User) => {
    setChangingPasswordUser(user);
    setChangePasswordModalOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setResettingPasswordUser(user);
    setResetPasswordModalOpen(true);
  };

  const handleSaveUser = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      if (formMode === 'create') {
        await userService.create(data as CreateUserInput);
        toast.success('Đã tạo người dùng thành công');
      } else if (editingUser) {
        await userService.update(editingUser.id, data as UpdateUserInput);
        toast.success('Đã cập nhật người dùng thành công');
      }
      reloadUsers();
    } catch (error: any) {
      throw error;
    }
  };

  const handleChangePasswordSave = async (data: ChangePasswordInput) => {
    if (!changingPasswordUser) return;
    try {
      await userService.changePassword(changingPasswordUser.id, data);
      toast.success('Đã đổi mật khẩu thành công');
    } catch (error: any) {
      throw error;
    }
  };

  const handleResetPasswordSave = async (data: ResetPasswordInput) => {
    try {
      await userService.resetPassword(data);
      toast.success('Đã reset mật khẩu thành công');
    } catch (error: any) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === 'ADMIN').length,
    staff: users.filter((u) => u.role === 'STAFF').length,
    active: users.filter((u) => u.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserManagementHeader onCreateUser={handleCreateUser} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Người Dùng</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quản Trị Viên</p>
                <p className="text-3xl font-bold text-gray-900">{stats.admin}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">👑</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nhân Viên</p>
                <p className="text-3xl font-bold text-gray-900">{stats.staff}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">👤</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang Hoạt Động</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">✅</div>
            </div>
          </div>
        </div>

        {/* User Table */}
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onChangePassword={handleChangePassword}
          onResetPassword={handleResetPassword}
          currentUserId={currentUser?.id}
        />
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        mode={formMode}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => {
          setChangePasswordModalOpen(false);
          setChangingPasswordUser(null);
        }}
        onSave={handleChangePasswordSave}
        user={changingPasswordUser}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setResetPasswordModalOpen(false);
          setResettingPasswordUser(null);
        }}
        onSave={handleResetPasswordSave}
        user={resettingPasswordUser}
      />
    </div>
  );
};

export default UserManagementPage;

