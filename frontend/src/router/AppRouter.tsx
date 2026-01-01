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
import { ROUTES } from '@constants';
import AdminRouteRedirect from '../components/admin/AdminRouteRedirect';

// ===== Lazy load layouts =====
const MainLayout = lazy(() => import('../components/layout/MainLayout'));
const POSLayoutNew = lazy(() => import('../components/layout/POSLayoutNew'));
const CustomerDisplayLayout = lazy(() => import('../components/layout/CustomerDisplayLayout'));
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));

// ===== Lazy load pages =====
const LoginPage = lazy(() => import('../pages/LoginPage/index'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage/index'));
const OrderDisplayPage = lazy(() => import('../pages/OrderDisplayPage/index'));
const PaymentCallbackPage = lazy(() => import('../pages/PaymentCallbackPage/index'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage/index'));

// ===== Admin Pages =====
const AdminOverviewPage = lazy(() => import('../pages/AdminOverviewPage/index'));
const AdminOrderManagementPage = lazy(() => import('../pages/AdminOrderManagementPage/index'));
const AdminMenuManagementPage = lazy(() => import('../pages/AdminMenuManagementPage/index'));
const AdminMenuProductsPage = lazy(() => import('../pages/AdminMenuManagementPage/ProductsPage'));
const AdminMenuCategoriesPage = lazy(() => import('../pages/AdminMenuManagementPage/CategoriesPage'));
const AdminMenuRecipesPage = lazy(() => import('../pages/AdminMenuManagementPage/RecipesPage'));
const AdminStockManagementPage = lazy(() => import('../pages/AdminStockManagementPage/index'));
const AdminAnalyticsPage = lazy(() => import('../pages/AdminAnalyticsPage/index'));
const AdminCustomerManagementPage = lazy(() => import('../pages/AdminCustomerManagementPage/index'));
const AdminStaffManagementPage = lazy(() => import('../pages/AdminStaffManagementPage/index'));
const AdminShiftManagementPage = lazy(() => import('../pages/AdminShiftManagementPage/index'));

// ===== Backward compatibility: Old AdminDashboardPage =====
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
// Simplified: Route already has ProtectedRoute, so we just need to render POSLayoutNew
// CheckoutPage will handle customer display logic internally
const CheckoutRoute: React.FC = () => {
  return (
    <POSLayoutNew />
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

          {/* Admin Routes - NEW STRUCTURE with nested routes */}
          <Route path={ROUTES.ADMIN_DASHBOARD} element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            {/* Handle query params redirect or show overview */}
            <Route index element={<AdminRouteRedirect />} />
            <Route path="orders" element={<AdminOrderManagementPage />} />
            <Route path="menu" element={<AdminMenuManagementPage />}>
              <Route index element={<Navigate to="products" replace />} />
              <Route path="products" element={<AdminMenuProductsPage />} />
              <Route path="categories" element={<AdminMenuCategoriesPage />} />
              <Route path="recipes" element={<AdminMenuRecipesPage />} />
            </Route>
            <Route path="stock" element={<AdminStockManagementPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="customers" element={<AdminCustomerManagementPage />} />
            <Route path="staff" element={<AdminStaffManagementPage />} />
            <Route path="shifts" element={<AdminShiftManagementPage />} />
            {/* Fallback: redirect to overview */}
            <Route path="*" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
          </Route>

          {/* Backward compatibility: Old AdminDashboardPage with query params */}
          {/* This will be handled by AdminRouteRedirect component */}

          {/* Analytics - Gộp Dashboard + Reporting (Staff Only) */}
          <Route path={ROUTES.ANALYTICS} element={
            <ProtectedRoute requiredRole="STAFF">
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AnalyticsPage />} />
          </Route>

          {/* Menu Management - Redirect to Admin Menu */}
          <Route path={ROUTES.MENU_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <Navigate to={ROUTES.ADMIN_MENU} replace />
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

          {/* Product Management - Redirect to Admin Menu Products */}
          <Route path={ROUTES.PRODUCT_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <Navigate to={ROUTES.ADMIN_MENU_PRODUCTS} replace />
            </ProtectedRoute>
          } />

          {/* Category Management - Redirect to Admin Menu Categories */}
          <Route path={ROUTES.CATEGORY_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <Navigate to={ROUTES.ADMIN_MENU_CATEGORIES} replace />
            </ProtectedRoute>
          } />

          {/* Stock Management - Redirect to Admin Stock */}
          <Route path={ROUTES.STOCK_MANAGEMENT} element={
            <ProtectedRoute requiredRole="ADMIN">
              <Navigate to={ROUTES.ADMIN_STOCK} replace />
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
