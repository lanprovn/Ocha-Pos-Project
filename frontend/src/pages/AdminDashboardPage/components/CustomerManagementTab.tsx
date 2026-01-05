import React, { useState, useCallback, useMemo } from 'react';
import { useCustomers } from '@features/customers/hooks/useCustomers';
import { useCustomerTags } from '@features/customers/hooks/useCustomerTags';
import { useCustomerStatistics } from '@features/customers/hooks/useCustomerStatistics';
import CustomerFilters from '@features/customers/components/CustomerFilters';
import CustomerList from '@features/customers/components/CustomerList';
import CustomerStatistics from '@features/customers/components/CustomerStatistics';
import CustomerDetailModal from '@features/customers/components/CustomerDetailModal';
import EditCustomerModal from '@features/customers/components/EditCustomerModal';
import AdjustPointsModal from '@features/customers/components/AdjustPointsModal';
import type { Customer, CustomerDetail, MembershipLevel } from '@/types/customer';

const CustomerManagementTab: React.FC = () => {
  const {
    customers,
    selectedCustomer,
    isLoading,
    error,
    pagination,
    filters,
    loadCustomerDetail,
    updateCustomer,
    adjustLoyaltyPoints,
    setSearchQuery,
    setMembershipLevelFilter,
    setTagsFilter,
    setIsActiveFilter,
    setPage,
    clearSelectedCustomer,
  } = useCustomers({ page: 1, limit: 10 });

  const { tags: availableTags } = useCustomerTags();
  const { statistics, isLoading: isLoadingStatistics, reload: reloadStatistics } = useCustomerStatistics();
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustPointsModal, setShowAdjustPointsModal] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'statistics'>('list');

  const handleViewDetail = useCallback(
    async (customer: Customer) => {
      setIsLoadingDetail(true);
      try {
        await loadCustomerDetail(customer.id);
      } catch (err) {
        console.error('Error loading customer detail:', err);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [loadCustomerDetail]
  );

  const handleEdit = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleAdjustPoints = useCallback(() => {
    setShowAdjustPointsModal(true);
  }, []);

  const handleSaveEdit = useCallback(
    async (data: {
      name?: string;
      phone?: string;
      email?: string | null;
      address?: string | null;
      dateOfBirth?: string | null;
      gender?: string | null;
      notes?: string | null;
      tags?: string[];
      membershipLevel?: MembershipLevel;
      isActive?: boolean;
    }) => {
      if (!selectedCustomer) return;
      await updateCustomer(selectedCustomer.id, data);
      // Reload customer detail to get updated data
      await loadCustomerDetail(selectedCustomer.id);
    },
    [selectedCustomer, updateCustomer, loadCustomerDetail]
  );

  const handleSaveAdjustPoints = useCallback(
    async (points: number, reason: string) => {
      if (!selectedCustomer) return;
      await adjustLoyaltyPoints(selectedCustomer.id, points, reason);
      // Reload customer detail to get updated data
      await loadCustomerDetail(selectedCustomer.id);
      // Reload statistics
      reloadStatistics();
    },
    [selectedCustomer, adjustLoyaltyPoints, loadCustomerDetail, reloadStatistics]
  );

  const handleCustomerClickFromStatistics = useCallback(
    async (customerId: string) => {
      setIsLoadingDetail(true);
      try {
        await loadCustomerDetail(customerId);
        setActiveView('list');
      } catch (err) {
        console.error('Error loading customer detail:', err);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [loadCustomerDetail]
  );

  const stats = useMemo(() => {
    const totalCustomers = pagination.total;
    const activeCustomers = customers.filter((c) => c.isActive).length;
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
    const totalSpent = customers.reduce((sum, c) => sum + Number(c.totalSpent), 0);

    return {
      totalCustomers,
      activeCustomers,
      totalLoyaltyPoints,
      totalSpent,
    };
  }, [customers, pagination.total]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveView('list')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeView === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Danh sách khách hàng
          </button>
          <button
            onClick={() => setActiveView('statistics')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeView === 'statistics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Thống kê & Phân tích
          </button>
        </div>
      </div>

      {activeView === 'list' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
              <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalCustomers}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-lg border-l-4 border-emerald-500 p-5 hover:shadow-md transition-shadow">
              <p className="text-xs text-emerald-700 mb-3 font-medium uppercase tracking-wide">Đang hoạt động</p>
              <p className="text-2xl font-bold text-emerald-900">{stats.activeCustomers}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-100/50 rounded-lg border-l-4 border-amber-500 p-5 hover:shadow-md transition-shadow">
              <p className="text-xs text-amber-700 mb-3 font-medium uppercase tracking-wide">Tổng điểm tích lũy</p>
              <p className="text-2xl font-bold text-amber-900">{stats.totalLoyaltyPoints.toLocaleString()}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-100/50 rounded-lg border-l-4 border-purple-500 p-5 hover:shadow-md transition-shadow">
              <p className="text-xs text-purple-700 mb-3 font-medium uppercase tracking-wide">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0,
                }).format(stats.totalSpent)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
            <CustomerFilters
              searchQuery={filters.search || ''}
              membershipLevel={filters.membershipLevel}
              selectedTags={filters.tags || []}
              isActive={filters.isActive}
              availableTags={availableTags}
              onSearchChange={setSearchQuery}
              onMembershipLevelChange={setMembershipLevelFilter}
              onTagsChange={setTagsFilter}
              onIsActiveChange={setIsActiveFilter}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Customer List */}
          <CustomerList customers={customers} isLoading={isLoading} onViewDetail={handleViewDetail} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{customers.length}</span> trong tổng số{' '}
                <span className="font-medium">{pagination.total}</span> khách hàng
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
        </>
      ) : (
        <>
          {/* Statistics View */}
          {statistics ? (
            <CustomerStatistics
              statistics={statistics}
              isLoading={isLoadingStatistics}
              onCustomerClick={handleCustomerClickFromStatistics}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              {isLoadingStatistics ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
                </>
              ) : (
                <p className="text-gray-500">Không thể tải thống kê khách hàng</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isLoading={isLoadingDetail}
        onClose={clearSelectedCustomer}
        onEdit={selectedCustomer ? handleEdit : undefined}
        onAdjustPoints={selectedCustomer ? handleAdjustPoints : undefined}
      />

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          availableTags={availableTags}
          isLoading={isLoading}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Adjust Points Modal */}
      {showAdjustPointsModal && selectedCustomer && (
        <AdjustPointsModal
          customer={selectedCustomer}
          isLoading={isLoading}
          onClose={() => setShowAdjustPointsModal(false)}
          onSave={handleSaveAdjustPoints}
        />
      )}
    </div>
  );
};

export default CustomerManagementTab;

