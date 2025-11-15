import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, MagnifyingGlassIcon, UserCircleIcon, ChartBarIcon, CubeIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../hooks/useCart';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import { usePOSDisplaySync } from '../../hooks/useDisplaySync';
import ProductGrid from '../features/pos/product/ProductGrid';
import ProductModal from '../features/pos/product/ProductModal';
import StockAlertsPanel from '../features/stock/alerts/StockAlertsPanel';
import { formatPrice } from '../../utils/formatPrice';
import type { Product } from '../../types/product';

/**
 * POSLayoutNew - Professional POS-style layout for staff
 * Similar to modern POS systems with header, left cart panel, and right product grid
 * Orange theme for staff interface
 * NO ANIMATIONS - Optimized for performance
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
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-50 shadow-sm">
        {/* Left: User Info, Navigation & Management Buttons */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <UserCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Nhân Viên POS'}</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">{user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Nhân Viên'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Đăng xuất"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
            <button
              onClick={() => navigate('/')}
              className="p-1 rounded hover:bg-gray-100 cursor-pointer"
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
          <div className="flex items-center space-x-3 ml-6">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md"
              title="Xem đơn hàng"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium">Đơn Hàng</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg shadow-md"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Doanh Thu</span>
            </button>
            
            {/* Search Bar - Moved next to Doanh Thu button */}
            <div className="w-64 ml-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Only show Stock Management button for Admin */}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/stock-management')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg shadow-md"
              >
                <CubeIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Tồn Kho</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Cart & Controls */}
        <aside className="w-96 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Order List Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ShoppingCartIcon className="w-5 h-5 mr-2 text-orange-600" />
              Đơn hàng hiện tại
            </h2>
            <p className="text-xs text-gray-500 mt-1">{totalItems} món</p>
          </div>

          {/* Order Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 text-sm">Chưa có món nào</p>
                <p className="text-gray-400 text-xs mt-1">Chọn món từ menu bên phải</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer ${
                    selectedItemId === item.id
                      ? 'bg-orange-50 border-orange-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-orange-300'
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
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, Math.max(1, item.quantity - 1));
                        }}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-gray-800 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-bold text-orange-600">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Totals */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold text-gray-800">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">VAT (10%):</span>
              <span className="font-semibold text-gray-800">{formatPrice(calculateTax())}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
              <span className="text-gray-800">Tổng cộng:</span>
              <span className="text-orange-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 bg-white space-y-2">
            {selectedItem && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  onClick={() => {
                    const newQty = prompt('Nhập số lượng:', selectedItem.quantity.toString());
                    if (newQty && !isNaN(Number(newQty)) && Number(newQty) > 0) {
                      updateQuantity(selectedItem.id, Number(newQty));
                    }
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700"
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
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700"
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
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700"
                >
                  Ghi chú
                </button>
              </div>
            )}
            
            <button
              onClick={clearCart}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium text-gray-700"
            >
              Xóa tất cả
            </button>
          </div>

          {/* Payment Button */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleCheckout}
              disabled={totalItems === 0}
              className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg flex items-center justify-center space-x-2 ${
                totalItems === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
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
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedCategoryId === 'all'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.name)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedCategoryId === category.name
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
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
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
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
    </div>
  );
}
