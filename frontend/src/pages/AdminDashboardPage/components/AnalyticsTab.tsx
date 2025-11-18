import React from 'react';
import DashboardTab from '../../AnalyticsPage/components/DashboardTab';
import ReportsTab from '../../AnalyticsPage/components/ReportsTab';
import { useState } from 'react';

const AnalyticsTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'reports'>('dashboard');

  return (
    <div>
      {/* Sub Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Sub Tabs">
            <button
              onClick={() => setActiveSubTab('dashboard')}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeSubTab === 'dashboard'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Tổng Quan
            </button>
            <button
              onClick={() => setActiveSubTab('reports')}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeSubTab === 'reports'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Báo Cáo Chi Tiết
            </button>
          </nav>
        </div>
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === 'dashboard' && <DashboardTab />}
      {activeSubTab === 'reports' && <ReportsTab />}
    </div>
  );
};

export default AnalyticsTab;

