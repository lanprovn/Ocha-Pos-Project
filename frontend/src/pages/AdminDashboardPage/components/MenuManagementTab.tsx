import React, { useState, useMemo } from 'react';
import { CubeIcon, TagIcon } from '@heroicons/react/24/outline';
import ProductManagementTab from '../../MenuManagementPage/components/ProductManagementTab';
import CategoryManagementTab from '../../MenuManagementPage/components/CategoryManagementTab';
import { useProducts } from '../../../hooks/useProducts';

const MenuManagementTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'categories'>('products');
  const { products, categories, isLoading } = useProducts();

  // Calculate stats - use empty arrays as fallback to avoid flickering
  const stats = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    const safeCategories = Array.isArray(categories) ? categories : [];
    
    const totalProducts = safeProducts.length;
    const availableProducts = safeProducts.filter(p => p.isAvailable !== false).length;
    const unavailableProducts = totalProducts - availableProducts;
    const totalCategories = safeCategories.length;
    const productsWithCategory = safeProducts.filter(p => p.category && p.category !== 'Unknown').length;
    const uncategorizedProducts = totalProducts - productsWithCategory;

    return {
      totalProducts,
      availableProducts,
      unavailableProducts,
      totalCategories,
      uncategorizedProducts,
    };
  }, [products, categories]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Sản Phẩm</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <CubeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đang Bán</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableProducts}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ngừng Bán</p>
              <p className="text-2xl font-bold text-red-600">{stats.unavailableProducts}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Danh Mục</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <TagIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8" aria-label="Sub Tabs">
            <button
              onClick={() => setActiveSubTab('products')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                ${
                  activeSubTab === 'products'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <CubeIcon className="w-5 h-5" />
              <span>Sản Phẩm ({stats.totalProducts})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('categories')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                ${
                  activeSubTab === 'categories'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <TagIcon className="w-5 h-5" />
              <span>Danh Mục ({stats.totalCategories})</span>
            </button>
          </nav>
        </div>

        {/* Sub Tab Content */}
        <div className="p-6">
          {activeSubTab === 'products' && <ProductManagementTab />}
          {activeSubTab === 'categories' && <CategoryManagementTab />}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MenuManagementTab);

