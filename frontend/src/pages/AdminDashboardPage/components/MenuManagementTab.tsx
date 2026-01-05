import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductManagementTab from '@features/stock/MenuManagementPage/components/ProductManagementTab';
import CategoryManagementTab from '@features/stock/MenuManagementPage/components/CategoryManagementTab';
import RecipeCheckTab from './RecipeCheckTab';
import { useProducts } from '@features/products/hooks/useProducts';

const MenuManagementTab: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subtabFromUrl = searchParams.get('subtab') as 'products' | 'categories' | 'recipes' | null;
  
  // Initialize activeSubTab from URL or default to 'products'
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'categories' | 'recipes'>(() => {
    return (subtabFromUrl && ['products', 'categories', 'recipes'].includes(subtabFromUrl))
      ? subtabFromUrl
      : 'products';
  });

  // Use ref to track if we're updating from URL to prevent loops
  const isUpdatingFromUrlRef = useRef(false);
  const lastSubtabFromUrlRef = useRef(subtabFromUrl);

  // Sync activeSubTab with URL param
  useEffect(() => {
    // Only update if URL param actually changed
    if (subtabFromUrl === lastSubtabFromUrlRef.current) {
      return;
    }
    
    lastSubtabFromUrlRef.current = subtabFromUrl;
    
    // Update activeSubTab based on URL param
    if (subtabFromUrl && ['products', 'categories', 'recipes'].includes(subtabFromUrl)) {
      isUpdatingFromUrlRef.current = true;
      setActiveSubTab(subtabFromUrl);
      requestAnimationFrame(() => {
        isUpdatingFromUrlRef.current = false;
      });
    }
  }, [subtabFromUrl]);

  // Update URL when tab changes
  useEffect(() => {
    // Don't update URL if we're currently syncing from URL
    if (isUpdatingFromUrlRef.current) {
      return;
    }
    
    // Only update URL if it doesn't match activeSubTab
    if (subtabFromUrl !== activeSubTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('subtab', activeSubTab);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [activeSubTab, subtabFromUrl, searchParams, setSearchParams]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 mb-3 font-medium uppercase tracking-wide">Tổng Sản Phẩm</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalProducts}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-lg border-l-4 border-emerald-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-emerald-700 mb-3 font-medium uppercase tracking-wide">Đang Bán</p>
          <p className="text-2xl font-bold text-emerald-900">{stats.availableProducts}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100/50 rounded-lg border-l-4 border-red-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-red-700 mb-3 font-medium uppercase tracking-wide">Ngừng Bán</p>
          <p className="text-2xl font-bold text-red-900">{stats.unavailableProducts}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-100/50 rounded-lg border-l-4 border-indigo-500 p-5 hover:shadow-md transition-shadow">
          <p className="text-xs text-indigo-700 mb-3 font-medium uppercase tracking-wide">Tổng Danh Mục</p>
          <p className="text-2xl font-bold text-indigo-900">{stats.totalCategories}</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 px-5">
          <nav className="-mb-px flex space-x-6" aria-label="Sub Tabs">
            <button
              onClick={() => setActiveSubTab('products')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                ${
                  activeSubTab === 'products'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              Sản Phẩm ({stats.totalProducts})
            </button>
            <button
              onClick={() => setActiveSubTab('categories')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                ${
                  activeSubTab === 'categories'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              Danh Mục ({stats.totalCategories})
            </button>
            <button
              onClick={() => setActiveSubTab('recipes')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                ${
                  activeSubTab === 'recipes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              Kiểm Tra Công Thức
            </button>
          </nav>
        </div>

        {/* Sub Tab Content */}
        <div className="p-5">
          {activeSubTab === 'products' && <ProductManagementTab />}
          {activeSubTab === 'categories' && <CategoryManagementTab />}
          {activeSubTab === 'recipes' && <RecipeCheckTab />}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MenuManagementTab);

