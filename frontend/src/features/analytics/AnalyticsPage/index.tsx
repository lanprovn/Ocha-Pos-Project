import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChartBarIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import HomeButton from '@components/ui/HomeButton';
import DashboardTab from './components/DashboardTab';
import ReportsTab from './components/ReportsTab';

type TabType = 'dashboard' | 'reports';

const AnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'dashboard');

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== tabFromUrl) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, tabFromUrl, setSearchParams]);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === 'dashboard' || tabFromUrl === 'reports')) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Tổng Quan',
      icon: ChartBarIcon,
    },
    {
      id: 'reports' as TabType,
      name: 'Báo Cáo',
      icon: DocumentChartBarIcon,
    },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Phân Tích & Báo Cáo</h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi doanh thu, thống kê và báo cáo chi tiết
              </p>
            </div>
            <HomeButton size="md" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b flex-shrink-0">
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

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

