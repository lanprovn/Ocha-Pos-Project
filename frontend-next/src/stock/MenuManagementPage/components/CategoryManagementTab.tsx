"use client";
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import { categoryService } from '@features/products/services/product.service';
import { useProducts } from '@features/products/hooks/useProducts';
import CategoryFormModal from '@features/stock/CategoryManagementPage/components/CategoryFormModal';
import CategoryTable from '@features/stock/CategoryManagementPage/components/CategoryTable';
import CategoryFilters from '@features/stock/CategoryManagementPage/components/CategoryFilters';
import type { Category } from '@/types/product';

const CategoryManagementTab: React.FC = () => {
  const { categories, loadProducts } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load categories on mount only - loadProducts is stable (useCallback with empty deps)
  useEffect(() => {
    // Only load if categories array is empty (initial load)
    if (categories.length === 0) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
    <div>
      {/* Action Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1">
          <CategoryFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <button
          onClick={handleCreate}
          className="ml-4 flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm Danh Mục</span>
        </button>
      </div>

      {/* Table */}
      <CategoryTable
        categories={filteredCategories}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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

export default CategoryManagementTab;

