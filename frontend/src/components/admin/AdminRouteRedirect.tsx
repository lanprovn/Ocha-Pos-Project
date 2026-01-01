import { useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../constants';

// Lazy load AdminOverviewPage
const AdminOverviewPage = lazy(() => import('../../pages/AdminOverviewPage/index'));

/**
 * Component to handle redirects from old query param routes to new nested routes
 * Example: /admin?tab=orders -> /admin/orders
 * If no query params or tab=overview, render AdminOverviewPage
 */
const AdminRouteRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const subtab = searchParams.get('subtab');
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirectedRef.current) return;

    // If there are query params, redirect to new routes
    if (tab && tab !== 'overview') {
      // Map từ query params cũ sang route mới
      const routeMap: Record<string, string> = {
        'orders': ROUTES.ADMIN_ORDERS,
        'menu': subtab === 'products' 
          ? ROUTES.ADMIN_MENU_PRODUCTS 
          : subtab === 'categories'
          ? ROUTES.ADMIN_MENU_CATEGORIES
          : subtab === 'recipes'
          ? ROUTES.ADMIN_MENU_RECIPES
          : ROUTES.ADMIN_MENU,
        'stock': ROUTES.ADMIN_STOCK,
        'analytics': ROUTES.ADMIN_ANALYTICS,
        'customers': ROUTES.ADMIN_CUSTOMERS,
        'staff': ROUTES.ADMIN_STAFF,
      };

      const newRoute = routeMap[tab];
      if (newRoute) {
        hasRedirectedRef.current = true;
        navigate(newRoute, { replace: true });
        return;
      } else {
        // Unknown tab, redirect to overview
        hasRedirectedRef.current = true;
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        return;
      }
    }
    
    // If tab is 'overview' or no tab, clear query params
    if ((tab === 'overview' || !tab) && searchParams.toString()) {
      hasRedirectedRef.current = true;
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    }
  }, [tab, subtab, navigate, searchParams]);

  // If no query params or tab is overview, render overview page
  if (!tab || tab === 'overview') {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
        </div>
      }>
        <AdminOverviewPage />
      </Suspense>
    );
  }

  // Otherwise, return null (will redirect)
  return null;
};

export default AdminRouteRedirect;

