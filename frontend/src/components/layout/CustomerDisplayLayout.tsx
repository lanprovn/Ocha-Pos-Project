import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, MagnifyingGlassIcon, UserCircleIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../../hooks/useCart';
import { useProducts } from '../../hooks/useProducts';
import { useFavorites } from '../../hooks/useFavorites';
import ProductGrid from '../features/pos/product/ProductGrid';
import ProductModal from '../features/pos/product/ProductModal';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';
import type { Product } from '../../types/product';

/**
 * CustomerDisplayLayout - Professional POS-style layout for customers
 * Similar to modern POS systems with header, left cart panel, and right product grid
 */
export default function CustomerDisplayLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart, setOrderCreator, addToCart } = useCart();
  const { filteredProducts, setSelectedCategory, searchQuery, setSearchQuery, isLoading, categories } = useProducts();
  const { favorites, isFavorite } = useFavorites();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Load table number from localStorage on mount
  useEffect(() => {
    const savedTableNumber = localStorage.getItem('customer_table_number');
    if (savedTableNumber) {
      setTableNumber(savedTableNumber);
    }
  }, []);

  // Save table number to localStorage whenever it changes
  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem('customer_table_number', tableNumber);
    } else {
      localStorage.removeItem('customer_table_number');
    }
  }, [tableNumber]);

  // Set order creator as customer when component mounts
  useEffect(() => {
    setOrderCreator({ type: 'customer', name: 'Khách Hàng' });
    return () => {
      setOrderCreator(null);
    };
  }, [setOrderCreator]);

  // Initialize category selection
  useEffect(() => {
    setSelectedCategory('all');
  }, [setSelectedCategory]);

  const handleCheckout = () => {
    if (totalItems > 0) {
      // Pass table number to checkout via state
      navigate('/checkout', {
        state: {
          tableNumber: tableNumber || undefined,
          fromCustomer: true // Đánh dấu đến từ customer page
        }
      });
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

  // Quick add to cart (default size, no toppings, quantity 1)
  const handleQuickAdd = (product: Product) => {
    const defaultSize = product.sizes?.[0];
    const basePrice = product.price + (defaultSize?.extraPrice || 0);
    
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      selectedSize: defaultSize,
      selectedToppings: [],
      note: '',
      quantity: 1,
      totalPrice: basePrice,
    });
    
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`, {
      icon: '✅',
      duration: 2000,
    });
  };

  // Filter products by favorites
  const displayedProducts = showFavoritesOnly
    ? filteredProducts.filter((p) => isFavorite(p.id))
    : filteredProducts;

  const calculateTax = () => {
    return totalPrice * 0.1; // 10% VAT
  };

  const finalTotal = totalPrice + calculateTax();

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-50">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-50 shadow-sm">
        {/* Left: User Info & Navigation */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Khách Hàng</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Trực tuyến</span>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
            <button
              onClick={() => navigate('/customer')}
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
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/customer/order-tracking')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm"
            title="Theo dõi đơn hàng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden sm:inline">Theo dõi</span>
          </button>
        </div>

        {/* Center: Table Number Input */}
        <div className="flex items-center space-x-4 mx-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="table-number" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Số bàn:
            </label>
            <input
              id="table-number"
              type="text"
              placeholder="VD: 1, 2, 3..."
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center font-semibold"
              maxLength={10}
            />
          </div>
        </div>

        {/* Right: Search Bar */}
        <div className="flex-1 max-w-md ml-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
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
              <ShoppingCartIcon className="w-5 h-5 mr-2 text-emerald-600" />
              Đơn hàng của bạn
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
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedItemId === item.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-emerald-300'
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
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                        if (selectedItemId === item.id) setSelectedItemId(null);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
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
                    <span className="text-sm font-bold text-emerald-600">
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
              <span className="text-emerald-600">{formatPrice(finalTotal)}</span>
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
              className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                totalItems === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transform hover:scale-105'
              }`}
            >
              <span>Thanh toán</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </aside>

        {/* Right Panel - Product Grid */}
        <main className="flex-1 overflow-y-auto bg-white">
              {location.pathname === '/customer' ? (
            <div className="p-6">
              {/* Category Filter & Favorites Toggle */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Danh mục</h3>
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      showFavoritesOnly
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={`${showFavoritesOnly ? 'Hiển thị tất cả' : 'Chỉ hiển thị món yêu thích'} (${favorites.length})`}
                  >
                    {showFavoritesOnly ? (
                      <HeartIconSolid className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>{showFavoritesOnly ? 'Món yêu thích' : 'Tất cả'}</span>
                    {favorites.length > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategoryId === 'all'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.name)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategoryId === category.name
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải sản phẩm...</p>
                </div>
              ) : showFavoritesOnly && displayedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Chưa có món yêu thích
                  </h3>
                  <p className="text-gray-500">
                    Nhấn vào biểu tượng ❤️ trên sản phẩm để thêm vào yêu thích
                  </p>
                </div>
              ) : (
                <ProductGrid 
                  products={displayedProducts} 
                  onProductClick={handleProductClick}
                  onQuickAdd={handleQuickAdd}
                />
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

      {/* Scrollbar Hide CSS */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
