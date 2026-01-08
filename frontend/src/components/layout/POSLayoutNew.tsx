import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, MagnifyingGlassIcon, UserCircleIcon, ChartBarIcon, CubeIcon, ArrowRightOnRectangleIcon, DocumentChartBarIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '@features/orders/hooks/useCart';
import { useProducts } from '@features/products/hooks/useProducts';
import { useAuth } from '@features/auth/hooks/useAuth';
import { usePOSDisplaySync } from '@/hooks/useDisplaySync';
import ProductGrid from '@features/products/components/ProductGrid';
import ProductModal from '@features/products/components/ProductModal';
import StockAlertsPanel from '@features/stock/components/StockAlertsPanel';
import { HoldOrderModal } from '@features/orders/OrderDisplayPage/components/HoldOrderModal';
import { HoldOrdersList } from '@features/orders/OrderDisplayPage/components/HoldOrdersList';
import { formatPrice } from '@/utils/formatPrice';
import type { Product } from '@/types/product';

/**
 * POSLayoutNew - Professional POS-style layout for staff
 * Similar to modern POS systems with header, left cart panel, and right product grid
 * Orange theme for staff interface
 */
export default function POSLayoutNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart, setOrderCreator } = useCart();
  const { filteredProducts, setSelectedCategory, searchQuery, setSearchQuery, isLoading, categories } = useProducts();
  const { user, logout } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showHoldOrdersList, setShowHoldOrdersList] = useState(false);

  // Sync cart data to customer display
  usePOSDisplaySync(items, totalPrice, totalItems, 'creating');

  // Set order creator as staff when component mounts
  useEffect(() => {
    setOrderCreator({ type: 'staff', name: 'Nhân Viên POS' });
    return () => {
      setOrderCreator(null);
    };
  }, [setOrderCreator]);

  // Initialize category selection
  useEffect(() => {
    setSelectedCategory('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckout = () => {
    if (totalItems > 0) {
      navigate('/checkout');
    }
  };


  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategoryId(categoryName);
    setSelectedCategory(categoryName);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const calculateTax = () => {
    return totalPrice * 0.1; // 10% VAT
  };

  const finalTotal = totalPrice + calculateTax();

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-50">
      <StockAlertsPanel />

      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-gray-300 flex items-center justify-between px-6 flex-shrink-0 z-50 shadow-sm">
        {/* Left: User Info, Navigation & Management Buttons */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center">
              <UserCircleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Nhân Viên POS'}</p>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span className="text-xs text-gray-600">{user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Nhân Viên'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            title="Đăng xuất"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
            <button
              onClick={() => navigate('/')}
              className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              title="Về trang chủ"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <span>/</span>
            <ShoppingCartIcon className="w-4 h-4" />
            <span className="font-medium text-gray-800">{selectedCategoryId === 'all' ? 'Tất cả' : selectedCategoryId}</span>
          </div>

          {/* Management Buttons - Moved to left */}
          <div className="flex items-center space-x-2 ml-6">
            <button
              onClick={() => setShowHoldOrdersList(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors shadow-sm"
              title="Xem đơn hàng đã lưu"
            >
              <BookmarkIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Đơn Đã Lưu</span>
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm"
              title="Xem đơn hàng"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium">Đơn Hàng</span>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm"
              title="Phân tích & Báo cáo"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Phân Tích</span>
            </button>
            {/* Admin Dashboard - Chỉ hiển thị cho Admin */}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors font-semibold"
                title="Admin Dashboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium">Admin</span>
              </button>
            )}

            {/* Search Bar - Moved next to Doanh Thu button */}
            <div className="w-64 ml-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-white"
                />
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Cart & Controls */}
        <aside className="w-96 bg-white border-r border-gray-300 flex flex-col flex-shrink-0">
          {/* Order List Header */}
          <div className="p-4 border-b border-gray-300 bg-blue-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ShoppingCartIcon className="w-5 h-5 mr-2 text-blue-600" />
              Đơn hàng hiện tại
            </h2>
            <p className="text-xs text-gray-600 mt-1">{totalItems} món</p>
          </div>

          {/* Order Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 text-sm font-medium">Chưa có món nào</p>
                <p className="text-gray-500 text-xs mt-1">Chọn món từ menu bên phải</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedItemId === item.id
                      ? 'bg-blue-50 border-blue-400 shadow-sm'
                      : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                      {item.selectedSize && (
                        <p className="text-xs text-gray-500 mt-1">Size: {item.selectedSize.name}</p>
                      )}
                      {item.selectedToppings.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Topping: {item.selectedToppings.map(t => t.name).join(', ')}
                        </p>
                      )}
                      {item.note && (
                        <p className="text-xs text-gray-500 mt-1 italic">Ghi chú: {item.note}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                        if (selectedItemId === item.id) setSelectedItemId(null);
                      }}
                      className="text-gray-400 hover:text-red-600 text-sm font-semibold transition-colors w-5 h-5 flex items-center justify-center"
                      title="Xóa món"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, Math.max(1, item.quantity - 1));
                        }}
                        className="w-7 h-7 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-sm font-semibold text-gray-700 transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-gray-800 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                        className="w-7 h-7 rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-sm font-semibold text-gray-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-bold text-blue-700">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Totals */}
          <div className="p-4 border-t border-gray-300 bg-blue-50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold text-gray-800">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">VAT (10%):</span>
              <span className="font-semibold text-gray-800">{formatPrice(calculateTax())}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-400">
              <span className="text-gray-800">Tổng cộng:</span>
              <span className="text-blue-700">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-300 bg-white space-y-2">
            {selectedItem && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  onClick={() => {
                    const newQty = prompt('Nhập số lượng:', selectedItem.quantity.toString());
                    if (newQty && !isNaN(Number(newQty)) && Number(newQty) > 0) {
                      updateQuantity(selectedItem.id, Number(newQty));
                    }
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700 transition-colors"
                >
                  Số lượng
                </button>
                <button
                  onClick={() => {
                    const discount = prompt('Nhập % giảm giá:', '0');
                    if (discount && !isNaN(Number(discount))) {
                      // Apply discount logic here
                      alert(`Giảm giá ${discount}%`);
                    }
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700 transition-colors"
                >
                  % Giảm
                </button>
                <button
                  onClick={() => {
                    const note = prompt('Ghi chú:', selectedItem.note || '');
                    if (note !== null) {
                      // Update note logic here
                      alert(`Ghi chú: ${note}`);
                    }
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700 transition-colors"
                >
                  Ghi chú
                </button>
              </div>
            )}

            <button
              onClick={clearCart}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700 transition-colors"
            >
              Xóa tất cả
            </button>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-300 bg-white space-y-2">
            {/* Hold Order Button */}
            <button
              onClick={() => setShowHoldModal(true)}
              disabled={totalItems === 0}
              className={`w-full py-2.5 rounded-md font-semibold text-sm transition-colors flex items-center justify-center space-x-2 ${
                totalItems === 0
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <BookmarkIcon className="w-4 h-4" />
              <span>Lưu đơn tạm</span>
            </button>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={totalItems === 0}
              className={`w-full py-3 rounded-md font-semibold text-white text-base transition-colors flex items-center justify-center space-x-2 ${
                totalItems === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-slate-700 hover:bg-slate-800'
              }`}
            >
              <span>Thanh toán</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </aside>

        {/* Right Panel - Product Grid or Outlet */}
        <main className="flex-1 overflow-y-auto bg-white">
          {location.pathname === '/checkout' ? (
            <Outlet />
          ) : location.pathname === '/' || location.pathname.startsWith('/product/') ? (
            <div className="p-6">
              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategoryId === 'all'
                        ? 'bg-slate-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.name)}
                      className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategoryId === category.name
                          ? 'bg-slate-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid or Outlet */}
              {location.pathname === '/' ? (
                isLoading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải sản phẩm...</p>
                  </div>
                ) : (
                  <ProductGrid products={filteredProducts} onProductClick={handleProductClick} />
                )
              ) : (
                <Outlet />
              )}
            </div>
          ) : (
            <div className="p-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Hold Order Modal */}
      <HoldOrderModal
        isOpen={showHoldModal}
        onClose={() => setShowHoldModal(false)}
        order={null}
        createFromCart={true}
        onSuccess={() => {
          clearCart();
          setShowHoldModal(false);
        }}
      />

      {/* Hold Orders List Modal */}
      <HoldOrdersList
        isOpen={showHoldOrdersList}
        onClose={() => setShowHoldOrdersList(false)}
        onResume={(orderId) => {
          setShowHoldOrdersList(false);
          // Cart will be loaded by HoldOrdersList component
        }}
      />
    </div>
  );
}
