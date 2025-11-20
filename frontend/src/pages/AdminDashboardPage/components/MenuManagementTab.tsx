import React, { useState, useMemo } from 'react';
import { CubeIcon, TagIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import ProductManagementTab from '../../MenuManagementPage/components/ProductManagementTab';
import CategoryManagementTab from '../../MenuManagementPage/components/CategoryManagementTab';
import RecipeCheckTab from './RecipeCheckTab';
import { useProducts } from '../../../hooks/useProducts';

const MenuManagementTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'categories' | 'recipes'>('products');
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Tổng Sản Phẩm</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <CubeIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Đang Bán</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.availableProducts}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Ngừng Bán</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.unavailableProducts}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Tổng Danh Mục</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalCategories}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
              <TagIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 px-6">
          <nav className="-mb-px flex space-x-8" aria-label="Sub Tabs">
            <button
              onClick={() => setActiveSubTab('products')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center space-x-2
                ${
                  activeSubTab === 'products'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              <CubeIcon className="w-5 h-5" />
              <span>Sản Phẩm ({stats.totalProducts})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('categories')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center space-x-2
                ${
                  activeSubTab === 'categories'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              <TagIcon className="w-5 h-5" />
              <span>Danh Mục ({stats.totalCategories})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('recipes')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center space-x-2
                ${
                  activeSubTab === 'recipes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Kiểm Tra Công Thức</span>
            </button>
          </nav>
        </div>

        {/* Sub Tab Content */}
        <div className="p-6">
          {activeSubTab === 'products' && <ProductManagementTab />}
          {activeSubTab === 'categories' && <CategoryManagementTab />}
          {activeSubTab === 'recipes' && <RecipeCheckTab />}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MenuManagementTab);

