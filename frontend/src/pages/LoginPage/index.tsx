import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants';
import toast from 'react-hot-toast';
import PageWrapper from '@components/layout/PageWrapper';
import PageContainer from '@components/layout/PageContainer';

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'STAFF' | 'ADMIN' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=overview`, { replace: true });
      } else {
        navigate(ROUTES.HOME, { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleRoleSelect = (role: 'STAFF' | 'ADMIN') => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
  };

  const handleBack = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!selectedRole) {
      toast.error('Vui lòng chọn vai trò');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password }, selectedRole);
    } catch {
      // Error already handled in login function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper background="gradient" fullHeight allowOverflow={false}>
      <PageContainer maxWidth="90%" centered padding="sm">
        {/* Logo/Title */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">
            OCHA POS
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">Hệ thống quản lý bán hàng</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-300 p-4 sm:p-6 md:p-8 w-full">
          {!selectedRole ? (
            // Role Selection
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Chọn vai trò đăng nhập
                </h2>
                <p className="text-sm text-gray-600">Vui lòng chọn vai trò của bạn để tiếp tục</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => handleRoleSelect('STAFF')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-md font-semibold text-base transition-colors flex flex-col items-center justify-center gap-2 shadow-md"
                >
                  <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-base">Nhân Viên</span>
                  <span className="text-xs opacity-80">Staff</span>
                </button>

                <button
                  onClick={() => handleRoleSelect('ADMIN')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 px-4 rounded-md font-semibold text-base transition-colors flex flex-col items-center justify-center gap-2 shadow-md"
                >
                  <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-base">Quản Trị Viên</span>
                  <span className="text-xs opacity-80">Admin</span>
                </button>
              </div>
            </div>
          ) : (
            // Login Form
            <div className="space-y-4">
              <button
                onClick={handleBack}
                className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Quay lại</span>
              </button>

              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-md mb-3 ${
                  selectedRole === 'STAFF' ? 'bg-blue-100' : 'bg-orange-100'
                }`}>
                  {selectedRole === 'STAFF' ? (
                    <svg className={`w-8 h-8 ${selectedRole === 'STAFF' ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                  Đăng nhập {selectedRole === 'STAFF' ? 'Nhân Viên' : 'Quản Trị Viên'}
                </h2>
                <p className="text-sm text-gray-600">Vui lòng nhập thông tin đăng nhập của bạn</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white ${
                        selectedRole === 'ADMIN' ? 'focus:ring-orange-500 focus:border-orange-500' : ''
                      }`}
                      placeholder="Nhập email của bạn"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white ${
                        selectedRole === 'ADMIN' ? 'focus:ring-orange-500 focus:border-orange-500' : ''
                      }`}
                      placeholder="Nhập mật khẩu"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-md font-semibold text-base text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md ${
                    selectedRole === 'STAFF' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Demo credentials hint */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded-md">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${
                    selectedRole === 'STAFF' ? 'bg-blue-600' : 'bg-orange-600'
                  }`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 mb-1 text-sm">Thông tin đăng nhập mẫu:</p>
                    <p className="text-sm text-gray-700 break-words">
                      {selectedRole === 'STAFF' ? (
                        <>
                          <span className="font-medium">Staff:</span>{' '}
                          <span className="font-mono bg-white px-2 py-1 rounded border border-gray-300 text-gray-900 text-xs">staff@ocha.com</span>{' '}
                          / <span className="font-mono bg-white px-2 py-1 rounded border border-gray-300 text-gray-900 text-xs">staff123</span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium">Admin:</span>{' '}
                          <span className="font-mono bg-white px-2 py-1 rounded border border-gray-300 text-gray-900 text-xs">admin@ocha.com</span>{' '}
                          / <span className="font-mono bg-white px-2 py-1 rounded border border-gray-300 text-gray-900 text-xs">admin123</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </PageWrapper>
  );
};

export default LoginPage;

