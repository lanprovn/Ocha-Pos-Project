  import { Component } from 'react';
  import type { ErrorInfo, ReactNode } from 'react';

  interface Props {
    children: ReactNode;
    fallback?: ReactNode;
  }

  interface State {
    hasError: boolean;
    error?: Error;
  }

  /**
   * Error Boundary component to catch and handle React errors
   * Provides fallback UI when errors occur
   */
  class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
      // Update state so the next render will show the fallback UI
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      // Log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }
      
      // In production, you might want to log to an error reporting service
      // Example: logErrorToService(error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        // Custom fallback UI
        if (this.props.fallback) {
          return this.props.fallback;
        }

        // Default fallback UI
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Đã xảy ra lỗi
              </h2>
              <p className="text-gray-600 mb-6">
                Xin lỗi, đã có lỗi xảy ra. Vui lòng tải lại trang hoặc thử lại sau.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Tải lại trang
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Quay lại
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Chi tiết lỗi (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        );
      }

      return this.props.children;
    }
  }

  export default ErrorBoundary;
