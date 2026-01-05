import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardTab from '@pages/AnalyticsPage/components/DashboardTab';
import ReportsTab from '@pages/AnalyticsPage/components/ReportsTab';

const AnalyticsTab: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subtabFromUrl = searchParams.get('subtab') as 'dashboard' | 'reports' | null;
  
  // Initialize activeSubTab from URL or default to 'dashboard'
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'reports'>(() => {
    return (subtabFromUrl && ['dashboard', 'reports'].includes(subtabFromUrl))
      ? subtabFromUrl
      : 'dashboard';
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
    if (subtabFromUrl && ['dashboard', 'reports'].includes(subtabFromUrl)) {
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

  return (
    <div>
      {/* Sub Tabs */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6 px-5" aria-label="Sub Tabs">
              <button
                onClick={() => setActiveSubTab('dashboard')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                  ${
                    activeSubTab === 'dashboard'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                Tổng Quan
              </button>
              <button
                onClick={() => setActiveSubTab('reports')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                  ${
                    activeSubTab === 'reports'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                Báo Cáo Chi Tiết
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === 'dashboard' && <DashboardTab />}
      {activeSubTab === 'reports' && <ReportsTab />}
    </div>
  );
};

export default React.memo(AnalyticsTab);

