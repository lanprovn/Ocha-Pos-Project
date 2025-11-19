import React, { useState, ErrorInfo, Component } from 'react';
import DashboardTab from '../../AnalyticsPage/components/DashboardTab';
import ReportsTab from '../../AnalyticsPage/components/ReportsTab';

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AnalyticsTab Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Đã xảy ra lỗi
              </h2>
              <p className="text-gray-600 mb-4">
                Không thể tải trang Phân tích & Báo cáo. Vui lòng thử lại sau.
              </p>
              {this.state.error && (
                <details className="text-left mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                    Chi tiết lỗi
                  </summary>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AnalyticsTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'reports'>('dashboard');

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default React.memo(AnalyticsTab);

