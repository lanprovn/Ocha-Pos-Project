import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserGroupIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { customerService, type Customer, type CustomerFilters, type MembershipLevel } from '../../services/customer.service';
import { formatPrice } from '../../utils/formatPrice';
import { useAuth } from '../../hooks/useAuth';
import CustomerDetailModal from './CustomerDetailModal';

const AdminCustomerManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    totalPoints: 0,
  });

  // Load customers and statistics
  useEffect(() => {
    const loadData = async () => {
      // Check if user is ADMIN
      if (!user || user.role !== 'ADMIN') {
        console.error('User is not ADMIN:', user);
        toast.error('Bạn không có quyền truy cập trang này');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [customersResponse, statsResponse] = await Promise.all([
          customerService.getAll({ limit: 1000 }), // Get all customers for now
          customerService.getStatistics(),
        ]);

        setCustomers(customersResponse.customers);
        setStats({
          total: statsResponse.total,
          bronze: statsResponse.byMembership.bronze,
          silver: statsResponse.byMembership.silver,
          gold: statsResponse.byMembership.gold,
          platinum: statsResponse.byMembership.platinum,
          totalPoints: statsResponse.totalPoints,
        });
      } catch (error: any) {
        console.error('Error loading customers:', error);
        const errorMessage = error?.message || error?.response?.data?.error || 'Không thể tải danh sách khách hàng';
        toast.error(errorMessage);
        
        // If 403, show more specific message
        if (errorMessage.includes('Forbidden') || errorMessage.includes('permissions')) {
          toast.error('Bạn không có quyền truy cập. Vui lòng đăng nhập lại với tài khoản ADMIN.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.email?.toLowerCase().includes(query)
      );
    }

    // Filter by membership level
    if (filter !== 'all') {
      filtered = filtered.filter((c) => c.membershipLevel.toLowerCase() === filter.toUpperCase());
    }

    return filtered;
  }, [customers, searchQuery, filter]);

  const getMembershipBadgeColor = (level: string) => {
    switch (level) {
      case 'BRONZE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SILVER':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hóa khách hàng này?')) {
      return;
    }

    try {
      await customerService.delete(id);
      toast.success('Đã vô hiệu hóa khách hàng');
      // Reload data
      const response = await customerService.getAll({ limit: 1000 });
      setCustomers(response.customers);
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error?.response?.data?.error || 'Không thể vô hiệu hóa khách hàng');
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng Khách Hàng</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-lg border-l-4 border-amber-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-amber-700 mb-3 font-medium uppercase tracking-wide">Bronze</p>
          <p className="text-2xl font-bold text-amber-900">{stats.bronze}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-gray-100/50 rounded-lg border-l-4 border-slate-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-700 mb-3 font-medium uppercase tracking-wide">Silver</p>
          <p className="text-2xl font-bold text-slate-900">{stats.silver}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg border-l-4 border-yellow-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-yellow-700 mb-3 font-medium uppercase tracking-wide">Gold</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.gold}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border-l-4 border-purple-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-purple-700 mb-3 font-medium uppercase tracking-wide">Platinum</p>
          <p className="text-2xl font-bold text-purple-900">{stats.platinum}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Khách Hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Thành Viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Điểm Tích Lũy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tổng Chi Tiêu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Đơn Hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Lần Cuối
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-sm">Chưa có khách hàng nào</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{customer.name}</div>
                        <div className="text-sm text-slate-500">{customer.phone}</div>
                        {customer.email && (
                          <div className="text-xs text-slate-400">{customer.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMembershipBadgeColor(
                          customer.membershipLevel
                        )}`}
                      >
                        {customer.membershipLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {customer.loyaltyPoints.toLocaleString('vi-VN')} điểm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatPrice(Number(customer.totalSpent))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {customer._count?.orders || 0} đơn
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {customer.lastVisitAt
                        ? new Date(customer.lastVisitAt).toLocaleDateString('vi-VN')
                        : 'Chưa có'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-medium"
                      >
                        Xem
                      </button>
                      {customer.isActive && (
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Vô hiệu hóa
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

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        customerId={selectedCustomerId}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCustomerId(null);
        }}
      />
    </div>
  );
};

export default React.memo(AdminCustomerManagementPage);
