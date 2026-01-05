import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants';
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
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@features/auth/hooks/useAuth';
import MenuManagementTab from './components/MenuManagementTab';
import StockManagementTab from './components/StockManagementTab';
import AnalyticsTab from './components/AnalyticsTab';
import OverviewTab from './components/OverviewTab';
import OrderManagementTab from './components/OrderManagementTab';
import CustomerManagementTab from './components/CustomerManagementTab';

type TabType = 'overview' | 'menu' | 'stock' | 'analytics' | 'orders' | 'customers';

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
      w-full flex items-start space-x-3 px-4 py-3 rounded-lg transition-all duration-200
      ${isActive
        ? 'bg-gradient-to-r from-slate-50 to-blue-50 text-slate-900 border-l-4 border-blue-600 shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }
    `}
  >
    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
    <div className="flex-1 text-left">
      <div className={`font-semibold text-sm ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
        {item.name}
      </div>
      <div className={`text-xs mt-0.5 ${isActive ? 'text-slate-600' : 'text-slate-500'}`}>
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
    return (tabFromUrl && ['overview', 'menu', 'stock', 'analytics', 'orders', 'customers'].includes(tabFromUrl)) 
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
    if (tabFromUrl && ['overview', 'menu', 'stock', 'analytics', 'orders', 'customers'].includes(tabFromUrl)) {
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
      id: 'customers',
      name: 'Quản Lý Khách Hàng',
      icon: UsersIcon,
      description: 'Xem và quản lý khách hàng',
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
          w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 flex flex-col shadow-sm
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Quản trị hệ thống</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
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
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-3 mb-3 px-2 py-2 rounded-lg bg-white/80">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <UserCircleIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-slate-500 truncate font-medium">Quản trị viên</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 flex-shrink-0 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{activeNavItem.name}</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{activeNavItem.description}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all duration-200 font-medium border border-slate-200 hover:border-slate-300"
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
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'menu' && <MenuManagementTab />}
            {activeTab === 'stock' && <StockManagementTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'orders' && <OrderManagementTab />}
            {activeTab === 'customers' && <CustomerManagementTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
