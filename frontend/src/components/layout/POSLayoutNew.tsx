import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useProducts } from '@features/products/hooks/useProducts';
import { useCart } from '@features/orders/hooks/useCart';
import { useAuth } from '@features/auth/hooks/useAuth';
import ProductGrid from '@features/products/components/ProductGrid';
import ProductModal from '@features/products/components/ProductModal';
import { ParkedOrdersDrawer } from '@features/orders/components/ParkedOrdersDrawer';
import { TableMapModal } from '@features/orders/components/TableMapModal';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/lib/utils';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ShoppingCart, Search, Bell, LogOut,
  LayoutGrid, Bookmark, ChevronRight, Trash2, Plus, Minus,
  History, Info, Package, ChevronLeft, CreditCard
} from 'lucide-react';

const POSLayoutNew: React.FC = () => {
  const { products, categories, isLoading } = useProducts();
  const {
    items, totalPrice, totalItems, removeFromCart, updateQuantity,
    clearCart, addToCart, parkedOrders
  } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isCheckout = location.pathname.startsWith('/checkout');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isParkedDrawerOpen, setIsParkedDrawerOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery);
      const matchCategory = !selectedCategory || p.category === selectedCategory || (selectedCategory === 'Tất cả');
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const menuItems = [
    { icon: LayoutGrid, label: 'Bàn', active: false, onClick: () => setIsTableModalOpen(true) },
    { icon: Bookmark, label: 'Đã lưu', active: false, badge: parkedOrders.length, onClick: () => setIsParkedDrawerOpen(true) },
    { icon: History, label: 'Lịch sử', active: false, onClick: () => navigate('/orders') },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* 1. Universal Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          {isCheckout ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="group font-bold text-slate-600 gap-2 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Quay lại POS
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ocha POS</h1>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Premium Terminal</span>
              </div>
            </div>
          )}

          {!isCheckout && (
            <div className="relative w-96 group animate-in fade-in slide-in-from-left duration-500">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <Input
                placeholder="Gõ tên món hoặc ID sản phẩm..."
                className="pl-12 h-11 bg-slate-100/50 border-none rounded-2xl font-medium focus-visible:ring-slate-200 transition-all focus-within:bg-white focus-within:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {isCheckout && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">Xác nhận thanh toán</h1>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none mt-1 inline-block">Secure Checkout</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
            {menuItems.map((item, idx) => (
              <Button
                key={idx}
                variant="ghost"
                size="sm"
                className="font-bold text-slate-600 gap-2 hover:bg-slate-100 relative"
                onClick={item.onClick}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-white p-1 pl-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Nhân Viên</p>
              <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Staff'}</p>
            </div>
            <Avatar className="w-8 h-8 rounded-xl border-2 border-slate-50">
              <AvatarFallback className="bg-emerald-500 text-white font-black text-xs">{user?.name?.charAt(0) || 'P'}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={logout} className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      {/* 2. Sidebars & Main Content */}
      <div className="flex flex-1 pt-20 overflow-hidden w-full">
        {/* Cart Sidebar - Only visible on menu page */}
        {!isCheckout && (
          <aside className="w-[420px] bg-white border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-500">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-slate-900" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Giỏ Hàng</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={clearCart} className="font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 gap-2">
                <Trash2 className="w-3 h-3" /> Clear
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Giỏ hàng đang trống</p>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-50 hover:border-slate-200 transition-all group overflow-hidden relative">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">{item.name}</h4>
                          <p className="text-xs font-black text-primary tracking-tighter mt-1">{formatPrice(item.totalPrice)}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg hover:bg-slate-50" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg bg-slate-900 text-white hover:bg-black" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-400 tracking-widest">
                  <span>Hóa đơn</span>
                  <span className="text-slate-900 font-black tracking-tighter text-lg">{formatPrice(totalPrice * 1.1)}</span>
                </div>
              </div>
              <Button
                disabled={items.length === 0}
                className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-xl transition-all font-black uppercase tracking-[0.2em] text-lg flex items-center justify-center gap-3 group active:scale-[0.98]"
                onClick={() => navigate('/checkout')}
              >
                THANH TOÁN <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </aside>
        )}

        {/* 3. Products/Checkout Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
          {location.pathname === '/' ? (
            <>
              <div className="p-8 pb-0">
                <div className="flex overflow-x-auto gap-3 no-scrollbar pb-6">
                  {['Tất cả', ...categories.map(c => c.name)].map((categoryName) => (
                    <Button
                      key={categoryName}
                      variant={selectedCategory === categoryName || (!selectedCategory && categoryName === 'Tất cả') ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedCategory(categoryName === 'Tất cả' ? null : categoryName)}
                      className={cn(
                        "px-6 h-11 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                        (selectedCategory === categoryName || (!selectedCategory && categoryName === 'Tất cả'))
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1"
                          : "bg-white text-slate-400 border border-slate-100 hover:bg-white"
                      )}
                    >
                      {categoryName}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(10)].map((_, i) => <div key={i} className="h-64 bg-slate-200 rounded-3xl animate-pulse" />)}
                  </div>
                ) : (
                  <ProductGrid
                    products={filteredProducts}
                    onProductClick={handleProductClick}
                    onQuickAdd={(p) => {
                      const defaultSize = p.sizes?.[0];
                      const basePrice = p.price + (defaultSize?.extraPrice || 0);
                      addToCart({
                        productId: p.id, name: p.name, image: p.image, basePrice: p.price,
                        selectedSize: defaultSize, selectedToppings: [], note: '', quantity: 1, totalPrice: basePrice,
                      });
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      <ProductModal product={selectedProduct} isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} />
      <ParkedOrdersDrawer isOpen={isParkedDrawerOpen} onClose={() => setIsParkedDrawerOpen(false)} />
      <TableMapModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} />
    </div>
  );
};

export default POSLayoutNew;
