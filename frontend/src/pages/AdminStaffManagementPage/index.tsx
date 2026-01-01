import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UsersIcon, MagnifyingGlassIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { staffService, type Staff, type StaffFilters } from '../../services/staff.service';
import { useAuth } from '../../hooks/useAuth';
import StaffFormModal from './StaffFormModal';

const AdminStaffManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'staff' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    staff: 0,
    active: 0,
    inactive: 0,
  });

  // Load staff and statistics
  useEffect(() => {
    const loadData = async () => {
      // Debug: Log current user info
      console.log('🔍 AdminStaffManagementPage - Current User:', currentUser);
      console.log('🔍 Token:', localStorage.getItem('token') || sessionStorage.getItem('token') ? 'Present' : 'Missing');
      
      // Verify user role with backend if currentUser exists but role check fails
      if (currentUser && currentUser.role !== 'ADMIN') {
        console.warn('⚠️ Frontend shows non-ADMIN role, verifying with backend...');
        try {
          const { authService } = await import('../../services/auth.service');
          const backendUser = await authService.getMe();
          console.log('🔍 Backend User:', backendUser);
          
          if (backendUser.role !== 'ADMIN') {
            console.error('❌ Backend confirms user is not ADMIN:', {
              frontendRole: currentUser.role,
              backendRole: backendUser.role,
            });
            toast.error('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản ADMIN.');
            setIsLoading(false);
            return;
          }
          // If backend says ADMIN but frontend doesn't, continue (token might be stale)
          console.log('✅ Backend confirms ADMIN role, proceeding...');
        } catch (verifyError: any) {
          console.error('❌ Error verifying user with backend:', verifyError);
          // Continue with frontend check
        }
      }
      
      // Check if user is ADMIN
      if (!currentUser || currentUser.role !== 'ADMIN') {
        console.error('❌ User is not ADMIN:', {
          user: currentUser,
          role: currentUser?.role,
          expectedRole: 'ADMIN'
        });
        toast.error('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản ADMIN.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('✅ User is ADMIN, fetching staff data...');
        const [staffResponse, statsResponse] = await Promise.all([
          staffService.getAll({ limit: 1000 }), // Get all staff for now
          staffService.getStatistics(),
        ]);

        setStaff(staffResponse.users);
        setStats({
          total: statsResponse.total,
          admin: statsResponse.byRole.admin,
          staff: statsResponse.byRole.staff,
          active: statsResponse.byStatus.active,
          inactive: statsResponse.byStatus.inactive,
        });
        console.log('✅ Staff data loaded successfully');
      } catch (error: any) {
        console.error('❌ Error loading staff:', error);
        console.error('❌ Error details:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
        });
        const errorMessage = error?.message || error?.response?.data?.error || 'Không thể tải danh sách nhân viên';
        toast.error(errorMessage);
        
        // If 403, show more specific message and log more details
        if (errorMessage.includes('Forbidden') || errorMessage.includes('permissions') || errorMessage.includes('Insufficient')) {
          console.error('❌ 403 Forbidden - User role:', currentUser?.role);
          console.error('❌ 403 Forbidden - Token present:', !!localStorage.getItem('token') || !!sessionStorage.getItem('token'));
          toast.error('Bạn không có quyền truy cập. Vui lòng đăng nhập lại với tài khoản ADMIN.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    let filtered = staff;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query)
      );
    }

    // Filter by role/status
    if (filter === 'admin') {
      filtered = filtered.filter((s) => s.role === 'ADMIN');
    } else if (filter === 'staff') {
      filtered = filtered.filter((s) => s.role === 'STAFF');
    } else if (filter === 'active') {
      filtered = filtered.filter((s) => s.isActive);
    } else if (filter === 'inactive') {
      filtered = filtered.filter((s) => !s.isActive);
    }

    return filtered;
  }, [staff, searchQuery, filter]);

  const handleToggleActive = useCallback(async (id: string, currentStatus: boolean) => {
    if (!confirm(`Bạn có chắc chắn muốn ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} nhân viên này?`)) {
      return;
    }

    try {
      await staffService.update(id, { isActive: !currentStatus });
      toast.success(`Đã ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} nhân viên`);
      // Reload data
      const response = await staffService.getAll({ limit: 1000 });
      setStaff(response.users);
      // Reload stats
      const statsResponse = await staffService.getStatistics();
      setStats({
        total: statsResponse.total,
        admin: statsResponse.byRole.admin,
        staff: statsResponse.byRole.staff,
        active: statsResponse.byStatus.active,
        inactive: statsResponse.byStatus.inactive,
      });
    } catch (error: any) {
      console.error('Error updating staff:', error);
      toast.error(error?.response?.data?.error || 'Không thể cập nhật nhân viên');
    }
  }, []);

  const handleFormSuccess = useCallback(async () => {
    // Reload data after successful create/update
    try {
      const [staffResponse, statsResponse] = await Promise.all([
        staffService.getAll({ limit: 1000 }),
        staffService.getStatistics(),
      ]);
      setStaff(staffResponse.users);
      setStats({
        total: statsResponse.total,
        admin: statsResponse.byRole.admin,
        staff: statsResponse.byRole.staff,
        active: statsResponse.byStatus.active,
        inactive: statsResponse.byStatus.inactive,
      });
    } catch (error: any) {
      console.error('Error reloading staff:', error);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng Nhân Viên</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border-l-4 border-purple-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-purple-700 mb-3 font-medium uppercase tracking-wide">Admin</p>
          <p className="text-2xl font-bold text-purple-900">{stats.admin}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg border-l-4 border-indigo-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-indigo-700 mb-3 font-medium uppercase tracking-wide">Nhân Viên</p>
          <p className="text-2xl font-bold text-indigo-900">{stats.staff}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-lg border-l-4 border-emerald-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-emerald-700 mb-3 font-medium uppercase tracking-wide">Đang Hoạt Động</p>
          <p className="text-2xl font-bold text-emerald-900">{stats.active}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100/50 rounded-lg border-l-4 border-red-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-red-700 mb-3 font-medium uppercase tracking-wide">Vô Hiệu Hóa</p>
          <p className="text-2xl font-bold text-red-900">{stats.inactive}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="admin">Admin</option>
            <option value="staff">Nhân Viên</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>

          <button
            onClick={() => {
              setEditingStaff(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm Nhân Viên</span>
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nhân Viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Vai Trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ngày Tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <UsersIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-sm">Chưa có nhân viên nào</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                          <UserCircleIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{member.name}</div>
                          <div className="text-sm text-slate-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        }`}
                      >
                        {member.role === 'ADMIN' ? 'Quản Trị Viên' : 'Nhân Viên'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {member.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(member.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingStaff(member);
                          setIsFormOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Sửa
                      </button>
                      {member.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleActive(member.id, member.isActive)}
                          className={`${
                            member.isActive
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-emerald-600 hover:text-emerald-900'
                          }`}
                        >
                          {member.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Form Modal */}
      <StaffFormModal
        isOpen={isFormOpen}
        mode={editingStaff ? 'edit' : 'create'}
        staff={editingStaff}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStaff(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default React.memo(AdminStaffManagementPage);
