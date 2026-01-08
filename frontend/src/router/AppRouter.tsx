import React, { Suspense, lazy, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@features/auth/context/AuthContext';
import { CartProvider } from '@features/orders/context/CartContext';
import { ProductProvider } from '@features/products/context/ProductContext';
import { IngredientProvider } from '@features/stock/context/IngredientContext';
import { ProtectedRoute } from '@features/auth/components/ProtectedRoute';
import { ROUTES } from '@constants';

// ===== Type Definitions =====
interface CheckoutLocationState {
  fromCustomer?: boolean;
  tableNumber?: string;
}

interface OrderSuccessLocationState {
  fromCustomer?: boolean;
}

// ===== Lazy load layouts =====
const MainLayout = lazy(() => import('../components/layout/MainLayout'));
const POSLayoutNew = lazy(() => import('../components/layout/POSLayoutNew'));
const CustomerDisplayLayout = lazy(() => import('../components/layout/CustomerDisplayLayout'));

// ===== Lazy load pages =====
const LoginPage = lazy(() => import('@features/auth/LoginPage/index'));
const CheckoutPage = lazy(() => import('@features/orders/CheckoutPage/index'));
const OrderDisplayPage = lazy(() => import('@features/orders/OrderDisplayPage/index'));
const PaymentCallbackPage = lazy(() => import('@/pages/PaymentCallbackPage/index'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage/index'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage/index'));

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
// Conditionally render layout based on whether checkout is from customer or staff
const CheckoutRoute: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as CheckoutLocationState | null;
  const isFromCustomer = locationState?.fromCustomer === true;

  // If from customer, render CheckoutPage directly without POSLayoutNew wrapper
  if (isFromCustomer) {
    return <CheckoutPage />;
  }

  // If from staff, wrap with POSLayoutNew
  return (
    <POSLayoutNew>
      <Outlet />
    </POSLayoutNew>
  );
};

/**
 * AppRoutes – xử lý toàn bộ định tuyến và tách riêng giao diện hiển thị
 */
function AppRoutes() {
  const location = useLocation();
  const locationState = location.state as OrderSuccessLocationState | null;
  
  const isDisplayPage = location.pathname.startsWith(ROUTES.CUSTOMER);
  const isLoginPage = location.pathname === ROUTES.LOGIN;
  const isOrderSuccessFromCustomer = location.pathname === ROUTES.ORDER_SUCCESS &&
    locationState?.fromCustomer === true;

  // === CASE 1: Customer Display (with layout like POS) ===
  // Tất cả routes trong customer section đều PUBLIC, không cần đăng nhập
  // Note: Checkout route is handled in CASE 2 by CheckoutRoute component
  // which will detect fromCustomer and render CheckoutPage directly
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
          {/* Backward compatibility: Old product detail URLs redirect to home */}
          <Route path={ROUTES.PRODUCT(':id')} element={
            <ProtectedRoute requiredRole="STAFF">
              <POSLayoutNew />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to={ROUTES.HOME} replace />} />
          </Route>

          {/* Checkout - Public (Customer) or Staff */}
          {/* Customer can checkout without login, Staff can checkout from POS */}
          <Route path={ROUTES.CHECKOUT} element={<CheckoutRoute />}>
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
              <Navigate to={{ pathname: ROUTES.ADMIN_DASHBOARD, search: '?tab=menu' }} replace />
            </ProtectedRoute>
          } />

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

          {/* Product Management - Redirect directly to Admin Dashboard with subtab */}
          <Route path={ROUTES.PRODUCT_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <Navigate to={{ pathname: ROUTES.ADMIN_DASHBOARD, search: '?tab=menu&subtab=products' }} replace />
            </ProtectedRoute>
          } />

          {/* Category Management - Redirect directly to Admin Dashboard with subtab */}
          <Route path={ROUTES.CATEGORY_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <Navigate to={{ pathname: ROUTES.ADMIN_DASHBOARD, search: '?tab=menu&subtab=categories' }} replace />
            </ProtectedRoute>
          } />

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
