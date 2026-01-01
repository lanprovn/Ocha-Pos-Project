import React from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import type { Supplier } from '../../types/supplier';

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, isLoading, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nhà Cung Cấp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Liên Hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-sm">Chưa có nhà cung cấp nào</p>
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                        <BuildingOfficeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{supplier.name}</div>
                        {supplier.taxCode && (
                          <div className="text-sm text-slate-500">MST: {supplier.taxCode}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      {supplier.contactName && <div>{supplier.contactName}</div>}
                      {supplier.phone && <div className="text-slate-500">{supplier.phone}</div>}
                      {supplier.email && <div className="text-slate-500">{supplier.email}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {supplier.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(supplier)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(supplier.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierTable;



