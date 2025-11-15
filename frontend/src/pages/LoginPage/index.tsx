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
        navigate(ROUTES.STOCK_MANAGEMENT, { replace: true });
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
        {/* Logo/Title with decorative elements - Compact for no scroll */}
        <div className="text-center mb-2 sm:mb-3 md:mb-4 relative">
          {/* Decorative circle behind logo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-orange-100 rounded-full opacity-20 blur-3xl -z-10"></div>

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent mb-1 sm:mb-2 tracking-tight">
              OCHA POS
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <div className="hidden sm:block h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium px-2">Hệ thống quản lý bán hàng</p>
              <div className="hidden sm:block h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Login Card with enhanced styling - Compact, no scroll */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-orange-100/50 p-3 sm:p-4 md:p-6 lg:p-8 w-full transform transition-all duration-300 hover:shadow-3xl">
          {!selectedRole ? (
            // Role Selection with enhanced design - Compact
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center mb-2 sm:mb-3 md:mb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  Chọn vai trò đăng nhập
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Vui lòng chọn vai trò của bạn để tiếp tục</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={() => handleRoleSelect('STAFF')}
                  className="group relative w-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white py-3 sm:py-4 md:py-5 px-3 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="whitespace-nowrap text-sm sm:text-base md:text-lg">Nhân Viên</span>
                    <span className="text-xs opacity-90">Staff</span>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('ADMIN')}
                  className="group relative w-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white py-3 sm:py-4 md:py-5 px-3 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:from-slate-800 hover:via-slate-900 hover:to-black transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:rotate-12">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="whitespace-nowrap text-sm sm:text-base md:text-lg">Quản Trị Viên</span>
                    <span className="text-xs opacity-90">Admin</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            // Login Form with enhanced design - Compact
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <button
                onClick={handleBack}
                className="group mb-2 sm:mb-3 text-gray-600 hover:text-orange-600 flex items-center gap-1.5 sm:gap-2 transition-all duration-200 font-medium text-xs sm:text-sm"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Quay lại</span>
              </button>

              <div className="text-center mb-2 sm:mb-3 md:mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 mb-2 sm:mb-3">
                  {selectedRole === 'STAFF' ? (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-0.5 sm:mb-1">
                  Đăng nhập {selectedRole === 'STAFF' ? 'Nhân Viên' : 'Quản Trị Viên'}
                </h2>
                <p className="text-xs text-gray-500 hidden sm:block">Vui lòng nhập thông tin đăng nhập của bạn</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 md:space-y-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 md:pl-4 flex items-center pointer-events-none">
                      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 sm:pl-10 md:pl-12 pr-2.5 sm:pr-3 md:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Nhập email của bạn"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 md:pl-4 flex items-center pointer-events-none">
                      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 sm:pl-10 md:pl-12 pr-2.5 sm:pr-3 md:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Nhập mật khẩu"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full py-2.5 sm:py-3 md:py-3.5 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden ${selectedRole === 'STAFF'
                    ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800'
                    : 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-900 hover:to-black'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  {isLoading ? (
                    <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs sm:text-sm">Đang đăng nhập...</span>
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5">
                      <span className="text-xs sm:text-sm md:text-base">Đăng nhập</span>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Demo credentials hint with enhanced design - Compact */}
              <div className="mt-2 sm:mt-3 md:mt-4 p-2 sm:p-3 md:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-lg sm:rounded-xl md:rounded-2xl">
                <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-blue-900 mb-0.5 sm:mb-1 text-xs">Thông tin đăng nhập mẫu:</p>
                    <p className="text-xs text-blue-800 break-words">
                      {selectedRole === 'STAFF' ? (
                        <>
                          <span className="font-semibold">Staff:</span>{' '}
                          <span className="font-mono bg-blue-100 px-1 sm:px-1.5 py-0.5 rounded text-blue-900 text-xs">staff@ocha.com</span>{' '}
                          / <span className="font-mono bg-blue-100 px-1 sm:px-1.5 py-0.5 rounded text-blue-900 text-xs">staff123</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">Admin:</span>{' '}
                          <span className="font-mono bg-blue-100 px-1 sm:px-1.5 py-0.5 rounded text-blue-900 text-xs">admin@ocha.com</span>{' '}
                          / <span className="font-mono bg-blue-100 px-1 sm:px-1.5 py-0.5 rounded text-blue-900 text-xs">admin123</span>
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

