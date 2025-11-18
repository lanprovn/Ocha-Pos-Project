import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';
import {
  CubeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  DocumentChartBarIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import MenuManagementTab from './components/MenuManagementTab';
import StockManagementTab from './components/StockManagementTab';
import AnalyticsTab from './components/AnalyticsTab';

type TabType = 'overview' | 'menu' | 'stock' | 'analytics';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  
  // Check if we're on /stock-management route
  const isStockManagementRoute = location.pathname === '/stock-management';
  
  // Set initial tab: if on /stock-management, use 'stock', otherwise use tab from URL or 'overview'
  const [activeTab, setActiveTab] = useState<TabType>(
    isStockManagementRoute ? 'stock' : (tabFromUrl || 'overview')
  );

  // Update URL when tab changes (but not if we're on /stock-management route)
  useEffect(() => {
    if (!isStockManagementRoute && activeTab !== tabFromUrl) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, tabFromUrl, setSearchParams, isStockManagementRoute]);

  // Update active tab when URL changes or when route changes
  useEffect(() => {
    if (isStockManagementRoute) {
      setActiveTab('stock');
    } else if (tabFromUrl && (tabFromUrl === 'overview' || tabFromUrl === 'menu' || tabFromUrl === 'stock' || tabFromUrl === 'analytics')) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, isStockManagementRoute, location.pathname]);

  const tabs = [
    {
      id: 'overview' as TabType,
      name: 'Tổng Quan',
      icon: HomeIcon,
    },
    {
      id: 'menu' as TabType,
      name: 'Quản Lý Menu',
      icon: CubeIcon,
    },
    {
      id: 'stock' as TabType,
      name: 'Quản Lý Tồn Kho',
      icon: Squares2X2Icon,
    },
    {
      id: 'analytics' as TabType,
      name: 'Phân Tích & Báo Cáo',
      icon: ChartBarIcon,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý hệ thống và các chức năng quản trị
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                title="Đăng xuất"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const handleTabClick = () => {
                if (tab.id === 'stock') {
                  navigate(ROUTES.STOCK_MANAGEMENT);
                } else {
                  setActiveTab(tab.id);
                }
              };
              return (
                <button
                  key={tab.id}
                  onClick={handleTabClick}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id || (tab.id === 'stock' && isStockManagementRoute)
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'menu' && <MenuManagementTab />}
          {activeTab === 'stock' && <StockManagementTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC = () => {
  const navigate = useNavigate();

  const adminFeatures = [
    {
      id: 'menu',
      title: 'Quản Lý Menu',
      description: 'Quản lý sản phẩm và danh mục',
      icon: CubeIcon,
      color: 'bg-blue-500',
      onClick: () => navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=menu`),
    },
    {
      id: 'stock',
      title: 'Quản Lý Tồn Kho',
      description: 'Theo dõi và quản lý tồn kho sản phẩm',
      icon: Squares2X2Icon,
      color: 'bg-green-500',
      onClick: () => navigate(ROUTES.STOCK_MANAGEMENT),
    },
    {
      id: 'analytics',
      title: 'Phân Tích & Báo Cáo',
      description: 'Xem báo cáo doanh thu và thống kê',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      onClick: () => navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=analytics`),
    },
    {
      id: 'orders',
      title: 'Quản Lý Đơn Hàng',
      description: 'Xem và quản lý tất cả đơn hàng',
      icon: DocumentChartBarIcon,
      color: 'bg-orange-500',
      onClick: () => navigate('/orders'),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Chào mừng đến Admin Dashboard</h2>
        <p className="text-gray-600">Quản lý toàn bộ hệ thống từ một nơi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={feature.onClick}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
            >
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng Sản Phẩm</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <CubeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cảnh Báo Tồn Kho</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <Squares2X2Icon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Doanh Thu Hôm Nay</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

