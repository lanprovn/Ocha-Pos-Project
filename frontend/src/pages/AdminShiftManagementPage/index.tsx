import React, { useState, useMemo, useEffect } from 'react';
import { ClockIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useShifts } from '../../hooks/useShifts';
import ShiftTable from './ShiftTable';
import ShiftFormModal from './ShiftFormModal';
import ShiftSummaryCard from './ShiftSummaryCard';
import ShiftFilters from './ShiftFilters';
import type { Shift, ShiftFilters as ShiftFiltersType } from '../../types/shift';
import { formatPrice } from '../../utils/formatPrice';

const AdminShiftManagementPage: React.FC = () => {
  const {
    shifts,
    currentShift,
    isLoading,
    loadShifts,
    loadCurrentShift,
    getShiftSummary,
    createShift,
    closeShift,
    updateShift,
    deleteShift,
  } = useShifts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ShiftFiltersType>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'close' | 'update'>('create');
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [viewingShift, setViewingShift] = useState<Shift | null>(null);

  const filteredShifts = useMemo(() => {
    let filtered = shifts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.shiftNumber.toLowerCase().includes(query) ||
          s.userName.toLowerCase().includes(query) ||
          s.userId.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [shifts, searchQuery]);

  const stats = useMemo(() => {
    const openShifts = filteredShifts.filter((s) => s.status === 'OPEN');
    const closedShifts = filteredShifts.filter((s) => s.status === 'CLOSED');
    const totalOpeningCash = filteredShifts.reduce(
      (sum, s) => sum + parseFloat(s.openingCash),
      0
    );
    const totalClosingCash = filteredShifts
      .filter((s) => s.closingCash)
      .reduce((sum, s) => sum + parseFloat(s.closingCash || '0'), 0);

    return {
      total: filteredShifts.length,
      open: openShifts.length,
      closed: closedShifts.length,
      totalOpeningCash,
      totalClosingCash,
    };
  }, [filteredShifts]);

  const handleCreate = () => {
    if (currentShift) {
      alert('Đã có ca làm việc đang mở. Vui lòng đóng ca hiện tại trước khi mở ca mới.');
      return;
    }
    setEditingShift(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleClose = (shift: Shift) => {
    setEditingShift(shift);
    setFormMode('close');
    setIsFormOpen(true);
  };

  const handleUpdate = (shift: Shift) => {
    setEditingShift(shift);
    setFormMode('update');
    setIsFormOpen(true);
  };

  const handleView = (shift: Shift) => {
    setViewingShift(shift);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) {
      return;
    }
    await deleteShift(id);
    loadShifts(filters);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingShift(null);
    loadShifts(filters);
    loadCurrentShift();
  };

  useEffect(() => {
    loadShifts(filters);
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Current Shift Alert */}
      {currentShift && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Ca Làm Việc Đang Mở</h4>
              <p className="text-sm text-green-700">
                Mã ca: <strong>{currentShift.shiftNumber}</strong> | Nhân viên:{' '}
                <strong>{currentShift.userName}</strong> | Tiền mở ca:{' '}
                <strong>{formatPrice(parseFloat(currentShift.openingCash))}</strong>
              </p>
            </div>
            <button
              onClick={() => handleClose(currentShift)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              Đóng Ca
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng Ca</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border-l-4 border-green-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-green-700 mb-3 font-medium uppercase tracking-wide">Đang Mở</p>
          <p className="text-2xl font-bold text-green-900">{stats.open}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border-l-4 border-slate-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-slate-700 mb-3 font-medium uppercase tracking-wide">Đã Đóng</p>
          <p className="text-2xl font-bold text-slate-900">{stats.closed}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border-l-4 border-purple-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-purple-700 mb-3 font-medium uppercase tracking-wide">
            Tổng Tiền Mở Ca
          </p>
          <p className="text-2xl font-bold text-purple-900">
            {formatPrice(stats.totalOpeningCash)}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm ca làm việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCreate}
            disabled={!!currentShift}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Mở Ca Mới</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <ShiftFilters filters={filters} onFiltersChange={setFilters} />

      {/* Shift Table */}
      <ShiftTable
        shifts={filteredShifts}
        isLoading={isLoading}
        onView={handleView}
        onClose={handleClose}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <ShiftFormModal
        isOpen={isFormOpen}
        mode={formMode}
        shift={editingShift}
        onClose={() => {
          setIsFormOpen(false);
          setEditingShift(null);
        }}
        onSuccess={handleFormSuccess}
        onCreate={createShift}
        onCloseShift={closeShift}
        onUpdate={updateShift}
      />

      {/* Summary Modal */}
      {viewingShift && (
        <ShiftSummaryCard
          shiftId={viewingShift.id}
          onClose={() => setViewingShift(null)}
          getSummary={getShiftSummary}
        />
      )}
    </div>
  );
};

export default React.memo(AdminShiftManagementPage);



