import React, { useState, useMemo } from 'react';
import { BuildingOfficeIcon, MagnifyingGlassIcon, PlusIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useSuppliers } from '../../hooks/useSuppliers';
import SupplierFormModal from './SupplierFormModal';
import SupplierTable from './SupplierTable';
import type { Supplier } from '../../types/supplier';

const AdminSupplierManagementPage: React.FC = () => {
  const { suppliers, isLoading, loadSuppliers, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.contactName?.toLowerCase().includes(query) ||
          s.phone?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query)
      );
    }

    if (filter === 'active') {
      filtered = filtered.filter((s) => s.isActive);
    } else if (filter === 'inactive') {
      filtered = filtered.filter((s) => !s.isActive);
    }

    return filtered;
  }, [suppliers, searchQuery, filter]);

  const stats = useMemo(() => {
    return {
      total: suppliers.length,
      active: suppliers.filter((s) => s.isActive).length,
      inactive: suppliers.filter((s) => !s.isActive).length,
    };
  }, [suppliers]);

  const handleCreate = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      return;
    }
    await deleteSupplier(id);
    loadSuppliers();
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
    loadSuppliers();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng Nhà Cung Cấp</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
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
              placeholder="Tìm kiếm nhà cung cấp..."
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
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>

          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm Nhà Cung Cấp</span>
          </button>
        </div>
      </div>

      {/* Supplier Table */}
      <SupplierTable
        suppliers={filteredSuppliers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <SupplierFormModal
        isOpen={isFormOpen}
        mode={editingSupplier ? 'edit' : 'create'}
        supplier={editingSupplier}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSupplier(null);
        }}
        onSuccess={handleFormSuccess}
        onCreate={createSupplier}
        onUpdate={updateSupplier}
      />
    </div>
  );
};

export default React.memo(AdminSupplierManagementPage);



