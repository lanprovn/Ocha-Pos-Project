import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { productService, categoryService } from '@features/products/services/product.service';
import { useProducts } from '@features/products/hooks/useProducts';
import ProductFormModal from './components/ProductFormModal';
import ProductTable from './components/ProductTable';
import ProductFilters from './components/ProductFilters';
import type { Product } from '@/types/product';

const ProductManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, categories, loadProducts } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((p) => {
        if (categoryFilter === 'uncategorized') {
          return !p.category || p.category === 'Unknown';
        }
        return p.category === categoryFilter;
      });
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter((p) =>
        availabilityFilter === 'available' ? p.isAvailable !== false : p.isAvailable === false
      );
    }

    return filtered;
  }, [products, searchQuery, categoryFilter, availabilityFilter]);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await productService.delete(String(product.id));
      toast.success('Đã xóa sản phẩm thành công');
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      if (editingProduct) {
        await productService.update(String(editingProduct.id), data);
        toast.success('Đã cập nhật sản phẩm thành công');
      } else {
        await productService.create(data);
        toast.success('Đã tạo sản phẩm thành công');
      }
      setIsFormOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý menu sản phẩm, giá cả và thông tin chi tiết
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Thêm Sản Phẩm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          availabilityFilter={availabilityFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          categories={categories}
        />
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <ProductTable
          products={filteredProducts}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ProductManagementPage;

