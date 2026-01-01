import React, { useMemo } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ROUTES } from '../../constants';

const AdminMenuManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, categories, isLoading } = useProducts();

  // Calculate stats - use empty arrays as fallback to avoid flickering
  const stats = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    const safeCategories = Array.isArray(categories) ? categories : [];
    
    const totalProducts = safeProducts.length;
    const availableProducts = safeProducts.filter(p => p.isAvailable !== false).length;
    const unavailableProducts = totalProducts - availableProducts;
    const totalCategories = safeCategories.length;

    return {
      totalProducts,
      availableProducts,
      unavailableProducts,
      totalCategories,
    };
  }, [products, categories]);

  // Determine active tab based on current path
  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/categories')) return 'categories';
    if (path.includes('/recipes')) return 'recipes';
    return 'products'; // default
  }, [location.pathname]);

  const handleTabClick = (tab: string) => {
    if (tab === 'products') {
      navigate(ROUTES.ADMIN_MENU_PRODUCTS);
    } else if (tab === 'categories') {
      navigate(ROUTES.ADMIN_MENU_CATEGORIES);
    } else if (tab === 'recipes') {
      navigate(ROUTES.ADMIN_MENU_RECIPES);
    }
  };

  // Note: Redirect is handled by router's index route, so we don't need to handle it here
  // This component will only render when path is /admin/menu/products, /admin/menu/categories, or /admin/menu/recipes

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
              onClick={() => handleTabClick('products')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                ${
                  activeTab === 'products'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              Sản Phẩm ({stats.totalProducts})
            </button>
            <button
              onClick={() => handleTabClick('categories')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                ${
                  activeTab === 'categories'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              Danh Mục ({stats.totalCategories})
            </button>
            <button
              onClick={() => handleTabClick('recipes')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                ${
                  activeTab === 'recipes'
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
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdminMenuManagementPage);

