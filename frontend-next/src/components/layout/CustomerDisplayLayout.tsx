"use client";
"use client";
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCartIcon, MagnifyingGlassIcon, UserCircleIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '@features/orders/hooks/useCart';
import { useProducts } from '@features/products/hooks/useProducts';
import { useFavorites } from '@/hooks/useFavorites';
import { useDisplaySync } from '@/hooks/useDisplaySync';
import ProductGrid from '@features/products/components/ProductGrid';
import ProductModal from '@features/products/components/ProductModal';
import OrderTrackingModal from './CustomerDisplayLayout/components/OrderTrackingModal';
import HomeButton from '@components/ui/HomeButton';
import { formatPrice } from '@/utils/formatPrice';
import toast from 'react-hot-toast';
import type { Product } from '@/types/product';
import type { DisplayData } from '@/types/display';

/**
 * CustomerDisplayLayout - Professional POS-style layout for customers
 * Similar to modern POS systems with header, left cart panel, and right product grid
 */
export default function CustomerDisplayLayout() {
  const navigate = useRouter();
  const location = usePathname();
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, updateCartItemNote, clearCart, setOrderCreator, addToCart } = useCart();
  const { filteredProducts, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, isLoading, categories } = useProducts();
  const { favorites, isFavorite } = useFavorites();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderTrackingModalOpen, setIsOrderTrackingModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [discountRate, setDiscountRate] = useState<number>(0);
  
  // Subscribe to display sync to receive discountRate updates from checkout
  const { subscribeToDisplay } = useDisplaySync();
  
  useEffect(() => {
    const unsubscribe = subscribeToDisplay((data: DisplayData) => {
      // Update discountRate when received from checkout
      if (data.discountRate !== undefined) {
        setDiscountRate(data.discountRate);
      }
    });
    
    return unsubscribe;
  }, [subscribeToDisplay]);

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

  // Initialize category selection on mount
  useEffect(() => {
    setSelectedCategory('all');
  }, [setSelectedCategory]);

  // Auto-open order tracking modal if orderId in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      setIsOrderTrackingModalOpen(true);
    }
  }, [location.search]);

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
      duration: 2000,
    });
  };

  // Filter products by favorites
  const displayedProducts = showFavoritesOnly
    ? filteredProducts.filter((p) => isFavorite(p.id))
    : filteredProducts;

  // Calculate prices with discount
  const subtotal = totalPrice;
  const discountAmount = discountRate > 0 ? subtotal * (discountRate / 100) : 0;
  const priceAfterDiscount = subtotal - discountAmount;
  
  const calculateTax = () => {
    return priceAfterDiscount * 0.1; // 10% VAT on price after discount
  };

  const finalTotal = priceAfterDiscount + calculateTax();

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-50">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-gray-300 flex items-center justify-between px-6 flex-shrink-0 z-50 shadow-sm">
        {/* Left: User Info & Navigation */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-md flex items-center justify-center">
              <UserCircleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Khách Hàng</p>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                <span className="text-xs text-gray-600">Trực tuyến</span>
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
            <span className="font-medium text-gray-800">{selectedCategory === 'all' ? 'Tất cả' : selectedCategory}</span>
          </div>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setIsOrderTrackingModalOpen(true);
            }}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-slate-700 hover:bg-gray-50 rounded-md transition-colors text-sm"
            title="Theo dõi đơn hàng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden sm:inline">Theo dõi</span>
          </button>
          <HomeButton size="sm" />
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
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-center font-semibold transition-colors bg-white"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-white"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Cart & Controls */}
        <aside className="w-96 bg-white border-r border-gray-300 flex flex-col flex-shrink-0">
          {/* Order List Header */}
          <div className="p-4 border-b border-gray-300 bg-slate-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCartIcon className="w-5 h-5 mr-2 text-slate-700" />
              Đơn hàng của bạn
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
                      ? 'bg-slate-50 border-slate-400 shadow-sm'
                      : 'bg-white border-gray-300 hover:border-slate-400 hover:bg-gray-50'
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
                        <p className="text-xs text-gray-600 mt-1 italic">
                          Ghi chú: {item.note}
                        </p>
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
                      <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
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
                    <span className="text-sm font-bold text-slate-700">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Totals */}
          <div className="p-4 border-t border-gray-300 bg-slate-50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            {discountRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">Giảm giá ({discountRate}%):</span>
                <span className="text-green-600 font-medium">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">VAT (10%):</span>
              <span className="font-semibold text-gray-900">{formatPrice(calculateTax())}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-400">
              <span className="text-gray-900">Tổng cộng:</span>
              <span className="text-slate-800">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-300 bg-white space-y-2">
            {selectedItem && (
              <div className="grid grid-cols-2 gap-2 mb-2">
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
                    const note = prompt('Ghi chú:', selectedItem.note || '');
                    if (note !== null) {
                      updateCartItemNote(selectedItem.id, note);
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

          {/* Payment Button */}
          <div className="p-4 border-t border-gray-300 bg-white">
            <button
              onClick={handleCheckout}
              disabled={totalItems === 0}
              className={`w-full py-3 rounded-md font-semibold text-white text-base transition-colors flex items-center justify-center space-x-2 ${totalItems === 0
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

        {/* Right Panel - Product Grid */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            {/* Category Filter & Favorites Toggle */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Danh mục</h3>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${showFavoritesOnly
                      ? 'bg-slate-700 text-white'
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
                  className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === 'all'
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
                    className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === category.name
                        ? 'bg-slate-700 text-white'
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
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải sản phẩm...</p>
              </div>
            ) : showFavoritesOnly && displayedProducts.length === 0 ? (
              <div className="text-center py-12">
                <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Chưa có món yêu thích
                </h3>
                <p className="text-sm text-gray-500">
                  Nhấn vào biểu tượng yêu thích trên sản phẩm để thêm vào danh sách
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

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingModalOpen}
        onClose={() => {
          setIsOrderTrackingModalOpen(false);
          // Remove orderId from URL when closing
          const params = new URLSearchParams(location.search);
          params.delete('orderId');
          navigate({ search: params.toString() }, { replace: true });
        }}
        initialOrderId={new URLSearchParams(location.search).get('orderId') || undefined}
      />

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
