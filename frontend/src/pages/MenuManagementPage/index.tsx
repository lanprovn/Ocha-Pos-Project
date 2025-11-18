import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CubeIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import HomeButton from '../../components/common/HomeButton';
import ProductManagementTab from './components/ProductManagementTab';
import CategoryManagementTab from './components/CategoryManagementTab';

type TabType = 'products' | 'categories';

const MenuManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'products');

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== tabFromUrl) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, tabFromUrl, setSearchParams]);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === 'products' || tabFromUrl === 'categories')) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const tabs = [
    {
      id: 'products' as TabType,
      name: 'Sản Phẩm',
      icon: CubeIcon,
    },
    {
      id: 'categories' as TabType,
      name: 'Danh Mục',
      icon: Squares2X2Icon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản Lý Menu</h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý sản phẩm và danh mục của cửa hàng
              </p>
            </div>
            <HomeButton size="md" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
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

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'products' && <ProductManagementTab />}
        {activeTab === 'categories' && <CategoryManagementTab />}
      </div>
    </div>
  );
};

export default MenuManagementPage;

