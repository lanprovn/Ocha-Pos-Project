"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProducts } from '@/products/hooks/useProducts';
import { useCart } from '@/orders/hooks/useCart';
import { useAuth } from '@/auth/hooks/useAuth';
import ProductGrid from '@/products/components/ProductGrid';
import ProductModal from '@/products/components/ProductModal';
import { ParkedOrdersDrawer } from '@/orders/components/ParkedOrdersDrawer';
import { TableMapModal } from '@/orders/components/TableMapModal';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Shadcn UI (Using dynamic imports or refs if needed, but assuming standard for now)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ShoppingCart, Search, LogOut, LayoutGrid, Bookmark,
  ChevronRight, Trash2, Plus, Minus, History, Package,
  ChevronLeft, CreditCard
} from 'lucide-react';

const POSLayoutNew: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { products, categories, isLoading } = useProducts();
  const {
    items, totalPrice, removeFromCart, updateQuantity,
    clearCart, addToCart, parkedOrders
  } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isCheckout = pathname.startsWith('/checkout');
  const isOrders = pathname.startsWith('/orders');

  // Search Optimization
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isParkedDrawerOpen, setIsParkedDrawerOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.id.toString().includes(debouncedSearch);
      const matchCategory = !selectedCategory || p.category === selectedCategory || (selectedCategory === 'Tất cả');
      return matchSearch && matchCategory;
    });
  }, [products, debouncedSearch, selectedCategory]);

  const handleProductClick = useCallback((product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  }, []);

  const menuItems = useMemo(() => [
    { icon: LayoutGrid, label: 'Bàn', active: false, onClick: () => setIsTableModalOpen(true) },
    { icon: Bookmark, label: 'Đã lưu', active: false, badge: parkedOrders.length, onClick: () => setIsParkedDrawerOpen(true) },
    { icon: History, label: 'Lịch sử', active: isOrders, onClick: () => router.push('/orders') },
  ], [parkedOrders.length, router, isOrders]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans select-none">
      {/* 1. Universal Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          {isCheckout || isOrders ? (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="group font-bold text-slate-600 gap-2 hover:bg-slate-100 rounded-2xl px-4"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Quay lại Menu
              </Button>
            </motion.div>
          ) : (
            <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ocha POS</h1>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Enterprise Next</span>
              </div>
            </Link>
          )}

          {!isCheckout && !isOrders && (
            <div className="relative w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <Input
                placeholder="Tìm sản phẩm..."
                className="pl-12 h-11 bg-slate-100/50 border-none rounded-2xl font-bold text-xs uppercase tracking-widest focus-visible:ring-slate-200 transition-all focus-within:bg-white focus-within:shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                className={cn(
                  "font-bold gap-2 rounded-xl relative hover:bg-slate-100 transition-all",
                  item.active ? "bg-slate-900 text-white hover:bg-black" : "text-slate-600"
                )}
                onClick={item.onClick}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] flex items-center justify-center border-2 border-white font-black"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-white p-1 pl-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Staff</p>
              <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Admin'}</p>
            </div>
            <Avatar className="w-8 h-8 rounded-xl border-2 border-slate-50 shadow-sm">
              <AvatarFallback className="bg-emerald-500 text-white font-black text-xs">{user?.name?.charAt(0) || 'P'}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={logout} className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      {/* 2. Sidebars & Content Area */}
      <div className="flex flex-1 pt-20 overflow-hidden w-full">
        <AnimatePresence mode="wait">
          {!isCheckout && !isOrders && (
            <motion.aside
              initial={{ x: -420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -420, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-[420px] bg-white border-r border-slate-200 flex flex-col z-10 overflow-hidden"
            >
              <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-slate-900" />
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Đơn hàng</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={clearCart} className="font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 gap-2 rounded-xl px-4">
                  <Trash2 className="w-3 h-3" /> Xóa
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 no-scrollbar">
                <AnimatePresence initial={false}>
                  {items.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                      <ShoppingCart className="w-12 h-12 text-slate-200" />
                      <p className="text-xs font-black uppercase tracking-widest italic">Giỏ hàng trống</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 py-4">
                      {items.map((item) => (
                        <motion.div
                          key={item.id} layout
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                          className="p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0 relative">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">{item.name}</h4>
                              <p className="text-xs font-black text-emerald-600 mt-1">{formatPrice(item.totalPrice)}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                              <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                              <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                              <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg bg-slate-900 text-white" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Tổng thanh toán</span>
                    <span className="text-slate-900 text-xl font-black tracking-tighter italic">{formatPrice(totalPrice * 1.1)}</span>
                  </div>
                </div>
                <Button
                  disabled={items.length === 0}
                  className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-[28px] shadow-2xl shadow-slate-300 transition-all font-black uppercase tracking-[0.3em] text-lg flex items-center justify-center gap-3 active:scale-[0.96]"
                  onClick={() => router.push('/checkout')}
                >
                  TIẾP TỤC <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
          <AnimatePresence mode="wait">
            {pathname === '/' ? (
              <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
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
                            ? "bg-slate-900 text-white shadow-xl shadow-slate-300 -translate-y-1"
                            : "bg-white text-slate-400 border border-slate-100 hover:border-slate-200"
                        )}
                      >
                        {categoryName}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
                  {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {[...Array(10)].map((_, i) => <div key={i} className="h-64 bg-slate-100 rounded-[32px] animate-pulse" />)}
                    </div>
                  ) : (
                    <ProductGrid products={filteredProducts} onProductClick={handleProductClick} onQuickAdd={addToCart} />
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="outlet" initial={{ opacity: 0, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.005 }} className="flex-1 overflow-hidden">
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ProductModal product={selectedProduct} isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} />
      <ParkedOrdersDrawer isOpen={isParkedDrawerOpen} onClose={() => setIsParkedDrawerOpen(false)} />
      <TableMapModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} />
    </div>
  );
};

export default POSLayoutNew;
