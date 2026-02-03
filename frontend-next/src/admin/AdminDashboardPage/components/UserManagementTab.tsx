"use client";
import React, { useState, useCallback, useMemo } from 'react';
import { useUsers } from '@features/users/hooks/useUsers';
import { useAuth } from '@features/auth/hooks/useAuth';
import UserList from '@features/users/components/UserList';
import UserFormModal from '@features/users/components/UserFormModal';
import type { User, CreateUserInput, UpdateUserInput } from '@/types/user';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserRound,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Key
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

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

  const stats = useMemo(() => {
    const totalUsers = pagination.total;
    const activeUsers = users.filter((u) => u.isActive).length;
    const adminUsers = users.filter((u) => u.role === 'ADMIN').length;
    const staffUsers = users.filter((u) => u.role === 'STAFF').length;

    return { totalUsers, activeUsers, adminUsers, staffUsers };
  }, [users, pagination.total]);

  const handleCreate = useCallback(async (data: CreateUserInput) => {
    await createUser(data);
    setShowCreateModal(false);
  }, [createUser]);

  const handleUpdate = useCallback(async (data: UpdateUserInput) => {
    if (!selectedUser) return;
    await updateUser(selectedUser.id, data);
    setShowEditModal(false);
    setSelectedUser(null);
  }, [selectedUser, updateUser]);

  const handleDelete = useCallback(async (user: User) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}"?`)) {
      await deleteUser(user.id);
    }
  }, [deleteUser]);

  const handleResetPassword = useCallback(async (user: User, newPassword: string) => {
    await resetPassword(user.id, newPassword);
    setShowResetPasswordModal(false);
    setSelectedUser(null);
  }, [resetPassword]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Người Dùng</h2>
          <p className="text-slate-500 text-sm">Quản lý tài khoản nhân viên và quyền truy cập</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary-hover shadow-lg font-bold">
          <UserPlus className="w-4 h-4 mr-2" /> Tạo tài khoản mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng Tài Khoản', val: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Online / Active', val: stats.activeUsers, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Quản Trị Viên', val: stats.adminUsers, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Nhân Viên', val: stats.staffUsers, icon: UserRound, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm bg-white/60 backdrop-blur-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{item.val}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Area */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tên hoặc email..."
                  value={filters.search || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-slate-200"
                />
              </div>
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Vai trò</label>
              <select
                value={filters.role || ''}
                onChange={(e) => setRoleFilter(e.target.value as 'ADMIN' | 'STAFF' | undefined || undefined)}
                className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none bg-slate-50/50"
              >
                <option value="">Tất cả vai trò</option>
                <option value="ADMIN">Quản trị viên</option>
                <option value="STAFF">Nhân viên</option>
              </select>
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Trạng thái</label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onChange={(e) => setIsActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none bg-slate-50/50"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Đã vô hiệu hóa</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <Button variant="ghost" size="icon" className="h-11 w-full text-slate-400 border border-slate-200 rounded-lg">
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-xl border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* User List Table Wrap */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
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
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-100 shadow-sm gap-4">
          <div className="text-sm text-slate-500 font-medium italic">
            Hiển thị <span className="text-slate-900 font-bold">{users.length}</span> nhân sự trong hệ thống
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="font-bold border-slate-200"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Trước
            </Button>
            <div className="px-4 py-1.5 bg-slate-50 rounded-lg text-xs font-black text-slate-600">
              {pagination.page} / {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="font-bold border-slate-200"
            >
              Sau <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserFormModal
        isOpen={showCreateModal}
        isLoading={isLoading}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

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

      {/* Reset Password Shadcn Dialog */}
      <Dialog open={showResetPasswordModal} onOpenChange={(open) => !open && setShowResetPasswordModal(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" /> Đặt lại mật khẩu
            </DialogTitle>
            <CardDescription>
              Thiết lập mật khẩu mới cho tài khoản <span className="font-bold text-slate-900">{selectedUser?.name}</span>
            </CardDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newPassword = formData.get('password') as string;
            if (newPassword && selectedUser) handleResetPassword(selectedUser, newPassword);
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Mật khẩu mới</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự..."
                  required
                  minLength={6}
                  className="h-11 border-slate-200"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowResetPasswordModal(false)}>Hủy bỏ</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 font-bold">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementTab;
