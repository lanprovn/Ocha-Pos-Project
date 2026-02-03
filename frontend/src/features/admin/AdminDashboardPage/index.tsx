import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuth } from '@features/auth/hooks/useAuth';
import MenuManagementTab from './components/MenuManagementTab';
import StockManagementTab from './components/StockManagementTab';
import AnalyticsTab from './components/AnalyticsTab';
import OverviewTab from './components/OverviewTab';
import CustomerManagementTab from './components/CustomerManagementTab';
import UserManagementTab from './components/UserManagementTab';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Package,
  Layers,
  Users,
  UserCog,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TabType = 'overview' | 'menu' | 'stock' | 'analytics' | 'customers' | 'users';

interface NavItem {
  id: TabType;
  name: string;
  icon: React.ElementType;
  description: string;
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth check
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (user.role !== 'ADMIN') {
      navigate(ROUTES.HOME);
      return;
    }
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-500 font-medium animate-pulse">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  // Tab logic
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return (tabFromUrl && ['overview', 'menu', 'stock', 'analytics', 'customers', 'users'].includes(tabFromUrl))
      ? tabFromUrl
      : 'overview';
  });

  const isUpdatingFromUrlRef = useRef(false);
  const lastTabFromUrlRef = useRef(tabFromUrl);

  useEffect(() => {
    if (tabFromUrl === lastTabFromUrlRef.current) return;
    lastTabFromUrlRef.current = tabFromUrl;

    if (tabFromUrl && ['overview', 'menu', 'stock', 'analytics', 'customers', 'users'].includes(tabFromUrl)) {
      isUpdatingFromUrlRef.current = true;
      setActiveTab(tabFromUrl);
      requestAnimationFrame(() => isUpdatingFromUrlRef.current = false);
    } else if (!tabFromUrl) {
      isUpdatingFromUrlRef.current = true;
      setActiveTab('overview');
      requestAnimationFrame(() => isUpdatingFromUrlRef.current = false);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (isUpdatingFromUrlRef.current) return;
    if (tabFromUrl !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, tabFromUrl, setSearchParams]);

  const navItems: NavItem[] = useMemo(() => [
    { id: 'overview', name: 'Tổng Quan', icon: Home, description: 'Báo cáo tổng hợp' },
    { id: 'menu', name: 'Menu', icon: Package, description: 'Quản lý sản phẩm' },
    { id: 'stock', name: 'Kho Hàng', icon: Layers, description: 'Nguyên liệu tồn kho' },
    { id: 'customers', name: 'Khách Hàng', icon: Users, description: 'Thông tin khách hàng' },
    { id: 'users', name: 'Nhân Sự', icon: UserCog, description: 'Quản lý nhân viên' },
    { id: 'analytics', name: 'Báo Cáo', icon: BarChart3, description: 'Phân tích chi tiết' },
  ], []);

  const handleTabClick = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const activeNavItem = useMemo(() =>
    navItems.find(item => item.id === activeTab) || navItems[0],
    [navItems, activeTab]
  );

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-[#ff5a3c] p-1.5 rounded-lg">
              <span className="text-white font-bold text-lg leading-none">O</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">OCHA POS</h1>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Admin Panel</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start h-auto py-3 px-4 ${isActive
                    ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                onClick={() => handleTabClick(item.id)}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                <div className="flex flex-col items-start text-left">
                  <span>{item.name}</span>
                  {isActive && <span className="text-[10px] font-normal opacity-80">{item.description}</span>}
                </div>
              </Button>
            );
          })}
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">A</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-gray-500 truncate">Online</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full justify-center text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all group"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
            Đăng Xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{activeNavItem.name}</h2>
              <p className="text-sm text-gray-500 hidden sm:block">{activeNavItem.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex bg-gray-50">
              v1.0.0
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
            </Button>
          </div>
        </header>

        {/* Tab Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'menu' && <MenuManagementTab />}
            {activeTab === 'stock' && <StockManagementTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'customers' && <CustomerManagementTab />}
            {activeTab === 'users' && <UserManagementTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
