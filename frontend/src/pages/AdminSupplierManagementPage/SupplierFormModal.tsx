import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Supplier, CreateSupplierInput, UpdateSupplierInput } from '../../types/supplier';

interface SupplierFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  supplier?: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
  onCreate: (data: CreateSupplierInput) => Promise<Supplier | null>;
  onUpdate: (id: string, data: UpdateSupplierInput) => Promise<Supplier | null>;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  mode,
  supplier,
  onClose,
  onSuccess,
  onCreate,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    notes: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && supplier) {
        setFormData({
          name: supplier.name || '',
          contactName: supplier.contactName || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || '',
          taxCode: supplier.taxCode || '',
          notes: supplier.notes || '',
          isActive: supplier.isActive,
        });
      } else {
        setFormData({
          name: '',
          contactName: '',
          phone: '',
          email: '',
          address: '',
          taxCode: '',
          notes: '',
          isActive: true,
        });
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, mode, supplier]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Tên nhà cung cấp không được để trống');
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        const createData: CreateSupplierInput = {
          name: formData.name.trim(),
          contactName: formData.contactName.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined,
          taxCode: formData.taxCode.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          isActive: formData.isActive,
        };
        await onCreate(createData);
      } else if (supplier) {
        const updateData: UpdateSupplierInput = {
          name: formData.name.trim(),
          contactName: formData.contactName.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined,
          taxCode: formData.taxCode.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          isActive: formData.isActive,
        };
        await onUpdate(supplier.id, updateData);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Không thể lưu nhà cung cấp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">
                {mode === 'create' ? 'Thêm Nhà Cung Cấp' : 'Sửa Nhà Cung Cấp'}
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tên nhà cung cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Người liên hệ
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">Hoạt động</option>
                    <option value="false">Vô hiệu hóa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierFormModal;



