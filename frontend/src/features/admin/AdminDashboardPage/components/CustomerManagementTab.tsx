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
import type { Customer, MembershipLevel } from '@/types/customer';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Users,
  UserCheck,
  Trophy,
  CreditCard,
  Filter,
  BarChart3,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';

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

  const handleEdit = useCallback(() => setShowEditModal(true), []);
  const handleAdjustPoints = useCallback(() => setShowAdjustPointsModal(true), []);

  const handleSaveEdit = useCallback(
    async (data: any) => {
      if (!selectedCustomer) return;
      await updateCustomer(selectedCustomer.id, data);
      await loadCustomerDetail(selectedCustomer.id);
    },
    [selectedCustomer, updateCustomer, loadCustomerDetail]
  );

  const handleSaveAdjustPoints = useCallback(
    async (points: number, reason: string) => {
      if (!selectedCustomer) return;
      await adjustLoyaltyPoints(selectedCustomer.id, points, reason);
      await loadCustomerDetail(selectedCustomer.id);
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
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
    const totalSpent = customers.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);

    return { totalCustomers, activeCustomers, totalLoyaltyPoints, totalSpent };
  }, [customers, pagination.total]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Khách Hàng</h2>
          <p className="text-slate-500 text-sm">Quản lý cơ sở dữ liệu và chương trình khách hàng thân thiết</p>
        </div>
        <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl">
          <Button
            variant={activeView === 'list' ? 'default' : 'ghost'}
            className={activeView === 'list' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500'}
            onClick={() => setActiveView('list')}
            size="sm"
          >
            <LayoutList className="w-4 h-4 mr-2" /> Danh sách
          </Button>
          <Button
            variant={activeView === 'statistics' ? 'default' : 'ghost'}
            className={activeView === 'statistics' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500'}
            onClick={() => setActiveView('statistics')}
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" /> Thống kê
          </Button>
        </div>
      </div>

      {activeView === 'list' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Hội Viên', val: stats.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Đang Hoạt Động', val: stats.activeCustomers, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Điểm Tích Lũy', val: stats.totalLoyaltyPoints.toLocaleString(), icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Tổng Doanh Thu', val: formatPrice(stats.totalSpent), icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' }
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

          {/* Filters Section */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <CardTitle className="text-sm font-bold text-slate-700">Bộ lọc thông minh</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
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
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3 text-rose-700">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Customer List */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative">
              <CustomerList customers={customers} isLoading={isLoading} onViewDetail={handleViewDetail} />
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-100 shadow-sm gap-4">
              <div className="text-sm text-slate-500 font-medium">
                Sản lượng hồ sơ <span className="text-slate-900 font-bold">{customers.length}</span> / <span className="text-slate-900 font-bold">{pagination.total}</span>
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
        </>
      ) : (
        <div className="animate-in fade-in duration-700">
          {statistics ? (
            <CustomerStatistics
              statistics={statistics}
              isLoading={isLoadingStatistics}
              onCustomerClick={handleCustomerClickFromStatistics}
            />
          ) : (
            <Card className="p-12 text-center border-none shadow-sm">
              <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Đang khởi tạo báo cáo phân tích...</p>
            </Card>
          )}
        </div>
      )}

      {/* Modals - Standard Shadcn Dialogs can be used here if refactored inside components */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isLoading={isLoadingDetail}
        onClose={clearSelectedCustomer}
        onEdit={selectedCustomer ? handleEdit : undefined}
        onAdjustPoints={selectedCustomer ? handleAdjustPoints : undefined}
      />

      {showEditModal && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          availableTags={availableTags}
          isLoading={isLoading}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

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
