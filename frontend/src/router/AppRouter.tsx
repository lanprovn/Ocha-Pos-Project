import React, { Suspense, lazy, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext.tsx';
import { ProductProvider } from '../context/ProductContext.tsx';
import { IngredientProvider } from '../context/IngredientContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@constants';

// ===== Lazy load layouts =====
const MainLayout = lazy(() => import('../components/layout/MainLayout'));
const POSLayoutNew = lazy(() => import('../components/layout/POSLayoutNew'));
const CustomerDisplayLayout = lazy(() => import('../components/layout/CustomerDisplayLayout'));

// ===== Lazy load pages =====
const LoginPage = lazy(() => import('../pages/LoginPage/index'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage/index'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage/index'));
const OrderSuccessPage = lazy(() => import('../pages/OrderSuccessPage/index'));
const DashboardPage = lazy(() => import('../pages/DashboardPage/index'));
const StockManagementPage = lazy(() => import('../pages/StockManagementPage/index'));
const OrderDisplayPage = lazy(() => import('../pages/OrderDisplayPage/index'));
const PaymentCallbackPage = lazy(() => import('../pages/PaymentCallbackPage/index'));
const ReportingPage = lazy(() => import('../pages/ReportingPage/index'));
const ProductManagementPage = lazy(() => import('../pages/ProductManagementPage/index'));
const CategoryManagementPage = lazy(() => import('../pages/CategoryManagementPage/index'));
const MenuManagementPage = lazy(() => import('../pages/MenuManagementPage/index'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage/index'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage/index'));

// ===== Loader Component =====
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Đang tải...</p>
    </div>
  </div>
);

// ===== Layout Reset Component =====
function LayoutReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageName = pathname.replace('/', '') || 'home';
    document.body.removeAttribute('data-page');
    document.body.setAttribute('data-page', pageName);
    // Allow overflow for login page
    if (pathname === ROUTES.LOGIN) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [pathname]);

  return null;
}

// ===== Checkout Route Component =====
// Component để tự động chọn layout cho checkout dựa trên authentication
const CheckoutRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Kiểm tra xem có phải từ customer page không
  const isFromCustomer = location.pathname.startsWith('/customer') || 
    (location.state as any)?.fromCustomer === true;
  
  // Nếu đã đăng nhập và không phải từ customer page → hiển thị với POS layout
  if (isAuthenticated && !isFromCustomer) {
    return (
      <ProtectedRoute>
        <POSLayoutNew />
      </ProtectedRoute>
    );
  }
  
  // Nếu không đăng nhập hoặc từ customer page → hiển thị standalone (public) với scroll
  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <div className="h-full w-full overflow-y-auto">
        <CheckoutPage />
      </div>
    </div>
  );
};

/**
 * AppRoutes – xử lý toàn bộ định tuyến và tách riêng giao diện hiển thị
 */
function AppRoutes() {
  const location = useLocation();
  const isDisplayPage = location.pathname.startsWith(ROUTES.CUSTOMER);
  const isLoginPage = location.pathname === ROUTES.LOGIN;
  const isOrderSuccessFromCustomer = location.pathname === ROUTES.ORDER_SUCCESS && 
    (location.state as any)?.fromCustomer === true;

  // === CASE 1: Customer Display (with layout like POS) ===
  // Tất cả routes trong customer section đều PUBLIC, không cần đăng nhập
  if (isDisplayPage || isOrderSuccessFromCustomer) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path={ROUTES.CUSTOMER} element={<CustomerDisplayLayout />}>
              {/* Layout tự render ProductGrid khi pathname === '/customer' */}
            </Route>
            {/* Customer order success - Redirect to checkout (now integrated) */}
            <Route path={ROUTES.ORDER_SUCCESS} element={<Navigate to={ROUTES.CHECKOUT} replace />} />
            <Route path="*" element={<Navigate to={ROUTES.CUSTOMER} replace />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  // === CASE 2: POS + Pages khác (dùng layout POS/Main) ===
  return (
    <div className={`min-h-screen w-full ${isLoginPage ? 'bg-gradient-to-br from-orange-50 via-white to-orange-50' : 'bg-gray-50'} ${isLoginPage ? 'overflow-auto' : 'overflow-x-hidden'}`}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Login Page - Public */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          {/* Protected Routes - Staff Only (POS) */}
          <Route path={ROUTES.HOME} element={
            <ProtectedRoute requiredRole="STAFF">
              <POSLayoutNew />
            </ProtectedRoute>
          }>
            {/* Layout tự render ProductGrid khi pathname === '/' */}
          </Route>

          {/* Product Detail - Redirect to home (use modal instead) - Staff Only */}
          <Route path={ROUTES.PRODUCT(':id')} element={
            <ProtectedRoute requiredRole="STAFF">
              <POSLayoutNew />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to={ROUTES.HOME} replace />} />
          </Route>

          {/* Order success - Redirect to checkout (now integrated) - Staff Only */}
          <Route path={ROUTES.ORDER_SUCCESS} element={
            <ProtectedRoute requiredRole="STAFF">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to={ROUTES.CHECKOUT} replace />} />
          </Route>

          {/* Checkout - Staff Only */}
          <Route path={ROUTES.CHECKOUT} element={
            <ProtectedRoute requiredRole="STAFF">
              <CheckoutRoute />
            </ProtectedRoute>
          }>
            <Route index element={<CheckoutPage />} />
          </Route>

          {/* Admin Dashboard - Tất cả chức năng admin */}
          <Route path={ROUTES.ADMIN_DASHBOARD} element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />

          {/* Analytics - Gộp Dashboard + Reporting (Staff Only) */}
          <Route path={ROUTES.ANALYTICS} element={
            <ProtectedRoute requiredRole="STAFF">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AnalyticsPage />} />
          </Route>

          {/* Menu Management - Redirect to Admin Dashboard */}
          <Route path={ROUTES.MENU_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to={{ pathname: ROUTES.ADMIN_DASHBOARD, search: '?tab=menu' }} replace />} />
          </Route>

          {/* Backward compatibility - Redirect old routes - Staff Only */}
          {/* Doanh Thu - Redirect to Analytics */}
          <Route path={ROUTES.DASHBOARD} element={
            <ProtectedRoute requiredRole="STAFF">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to={ROUTES.ANALYTICS} replace />} />
          </Route>

          {/* Reporting - Redirect to Analytics */}
          <Route path={ROUTES.REPORTING} element={
            <ProtectedRoute requiredRole="STAFF">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to={{ pathname: ROUTES.ANALYTICS, search: '?tab=reports' }} replace />} />
          </Route>

          {/* Product Management - Redirect to Menu Management */}
          <Route path={ROUTES.PRODUCT_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to={{ pathname: ROUTES.MENU_MANAGEMENT, search: '?tab=products' }} replace />} />
          </Route>

          {/* Category Management - Redirect to Menu Management */}
          <Route path={ROUTES.CATEGORY_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to={{ pathname: ROUTES.MENU_MANAGEMENT, search: '?tab=categories' }} replace />} />
          </Route>

          {/* Stock Management - Redirect to Admin Dashboard with stock tab */}
          <Route path={ROUTES.STOCK_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <Navigate to={{ pathname: ROUTES.ADMIN_DASHBOARD, search: '?tab=stock' }} replace />
            </ProtectedRoute>
          } />

          {/* Order Display - Staff Only */}
          <Route path={ROUTES.ORDERS} element={
            <ProtectedRoute requiredRole="STAFF">
              <OrderDisplayPage />
            </ProtectedRoute>
          } />

          {/* Payment Callback - Public (no auth required for callback) */}
          <Route path={ROUTES.PAYMENT_CALLBACK} element={<PaymentCallbackPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

/**
 * AppRouter – bọc provider và router
 */
const AppRouter: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <LayoutReset />
        <CartProvider>
          <ProductProvider>
            <IngredientProvider>
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
                containerStyle={{
                  top: 20,
                  right: 20,
                }}
              />
            </IngredientProvider>
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;
