"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { categoryService } from '@features/products/services/product.service';
import { useProducts } from '@features/products/hooks/useProducts';
import CategoryFormModal from './components/CategoryFormModal';
import CategoryTable from './components/CategoryTable';
import CategoryFilters from './components/CategoryFilters';
import type { Category } from '@/types/product';

const CategoryManagementPage: React.FC = () => {
  const navigate = useRouter();
  const { categories, loadProducts } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load categories on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [categories, searchQuery]);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await categoryService.delete(String(category.id));
      toast.success('Đã xóa danh mục thành công');
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      if (editingCategory) {
        await categoryService.update(String(editingCategory.id), data);
        toast.success('Đã cập nhật danh mục thành công');
      } else {
        await categoryService.create(data);
        toast.success('Đã tạo danh mục thành công');
      }
      setIsFormOpen(false);
      setEditingCategory(null);
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Danh Mục</h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý danh mục sản phẩm và tổ chức menu
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Thêm Danh Mục</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <CategoryFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <CategoryTable
          categories={filteredCategories}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <CategoryFormModal
          category={editingCategory}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default CategoryManagementPage;

