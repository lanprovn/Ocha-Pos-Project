import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../constants';
import {
  CubeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  DocumentChartBarIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import MenuManagementTab from './components/MenuManagementTab';
import StockManagementTab from './components/StockManagementTab';
import AnalyticsTab from './components/AnalyticsTab';
import OverviewTab from './components/OverviewTab';
import OrderManagementTab from './components/OrderManagementTab';

type TabType = 'overview' | 'menu' | 'stock' | 'analytics' | 'orders';

interface NavItem {
  id: TabType;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}

// Memoized NavButton component to prevent re-renders
const NavButton = React.memo<{
  item: NavItem;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
  onClick: () => void;
}>(({ item, Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-start space-x-3 px-4 py-3 rounded-lg transition-all
      ${isActive
        ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-500'
        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
  >
    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
    <div className="flex-1 text-left">
      <div className={`font-medium ${isActive ? 'text-orange-900' : 'text-gray-900'}`}>
        {item.name}
      </div>
      <div className={`text-xs mt-0.5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
        {item.description}
      </div>
    </div>
  </button>
));

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Set initial tab: use tab from URL or default to 'overview'
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return (tabFromUrl && ['overview', 'menu', 'stock', 'analytics', 'orders'].includes(tabFromUrl)) 
      ? tabFromUrl 
      : 'overview';
  });

  // Use ref to track if we're updating from URL to prevent loops
  const isUpdatingFromUrlRef = useRef(false);
  const lastTabFromUrlRef = useRef(tabFromUrl);

  // Sync activeTab with URL param - only update activeTab from URL
  useEffect(() => {
    // Only update if URL param actually changed
    if (tabFromUrl === lastTabFromUrlRef.current) {
      return;
    }
    
    lastTabFromUrlRef.current = tabFromUrl;
    
    // Update activeTab based on URL param
    if (tabFromUrl && ['overview', 'menu', 'stock', 'analytics', 'orders'].includes(tabFromUrl)) {
      isUpdatingFromUrlRef.current = true;
      setActiveTab(tabFromUrl);
      // Reset flag in next tick
      requestAnimationFrame(() => {
        isUpdatingFromUrlRef.current = false;
      });
    } else if (!tabFromUrl) {
      // Default to overview if no tab in URL
      isUpdatingFromUrlRef.current = true;
      setActiveTab('overview');
      requestAnimationFrame(() => {
        isUpdatingFromUrlRef.current = false;
      });
    }
  }, [tabFromUrl]); // Removed activeTab from deps to prevent loop

  // Update URL when tab changes
  useEffect(() => {
    // Don't update URL if we're currently syncing from URL
    if (isUpdatingFromUrlRef.current) {
      return;
    }
    
    // Only update URL if it doesn't match activeTab
    if (tabFromUrl !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, tabFromUrl, setSearchParams]);

  // Memoize navItems to prevent recreation on every render
  const navItems: NavItem[] = useMemo(() => [
    {
      id: 'overview',
      name: 'Tổng Quan',
      icon: HomeIcon,
      description: 'Dashboard và thống kê tổng thể',
    },
    {
      id: 'orders',
      name: 'Quản Lý Đơn Hàng',
      icon: DocumentChartBarIcon,
      description: 'Xem và quản lý đơn hàng',
    },
    {
      id: 'menu',
      name: 'Quản Lý Menu',
      icon: CubeIcon,
      description: 'Sản phẩm và danh mục',
    },
    {
      id: 'stock',
      name: 'Quản Lý Tồn Kho',
      icon: Squares2X2Icon,
      description: 'Tồn kho và nguyên liệu',
    },
    {
      id: 'analytics',
      name: 'Phân Tích & Báo Cáo',
      icon: ChartBarIcon,
      description: 'Báo cáo và thống kê',
    },
  ], []); // Empty deps - navItems never change

  // Memoize handleTabClick to prevent recreation
  const handleTabClick = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Close mobile sidebar
  }, []);

  // Memoize handleLogout to prevent recreation
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Memoize activeNavItem to prevent recalculation
  const activeNavItem = useMemo(() => 
    navItems.find(item => item.id === activeTab) || navItems[0],
    [navItems, activeTab]
  );

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500 mt-1">Quản trị hệ thống</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Determine if this tab should be active
            const isActive = activeTab === item.id;
            
            return (
              <NavButton
                key={item.id}
                item={item}
                Icon={Icon}
                isActive={isActive}
                onClick={() => handleTabClick(item.id)}
              />
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3 px-2">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">Quản trị viên</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{activeNavItem.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{activeNavItem.description}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Quay lại trang trước"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Quay lại</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'menu' && <MenuManagementTab />}
            {activeTab === 'stock' && <StockManagementTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'orders' && <OrderManagementTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
