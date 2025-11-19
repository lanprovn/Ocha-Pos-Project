import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import { productService } from '../../../services/product.service';
import { useProducts } from '../../../hooks/useProducts';
import ProductFormModal from '../../ProductManagementPage/components/ProductFormModal';
import ProductTable from '../../ProductManagementPage/components/ProductTable';
import ProductFilters from '../../ProductManagementPage/components/ProductFilters';
import type { Product } from '../../../types/product';

const ProductManagementTab: React.FC = () => {
  const { products, categories, loadProducts } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Load products on mount only - loadProducts is stable (useCallback with empty deps)
  useEffect(() => {
    // Only load if products array is empty (initial load)
    if (products.length === 0) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
    <div>
      {/* Action Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1">
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
        <button
          onClick={handleCreate}
          className="ml-4 flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm Sản Phẩm</span>
        </button>
      </div>

      {/* Table */}
      <ProductTable
        products={filteredProducts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <ProductFormModal
        product={editingProduct}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductManagementTab;

