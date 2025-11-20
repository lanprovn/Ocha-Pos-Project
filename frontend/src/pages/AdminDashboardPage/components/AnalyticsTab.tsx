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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                Đã xảy ra lỗi
              </h2>
              <p className="text-slate-600 mb-4 font-medium">
                Không thể tải trang Phân tích & Báo cáo. Vui lòng thử lại sau.
              </p>
              {this.state.error && (
                <details className="text-left mt-4">
                  <summary className="cursor-pointer text-sm text-slate-500 mb-2 font-medium">
                    Chi tiết lỗi
                  </summary>
                  <pre className="text-xs bg-slate-100 p-2 rounded-lg overflow-auto max-h-40 font-mono">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm hover:shadow"
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Sub Tabs">
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
    </ErrorBoundary>
  );
};

export default React.memo(AnalyticsTab);

