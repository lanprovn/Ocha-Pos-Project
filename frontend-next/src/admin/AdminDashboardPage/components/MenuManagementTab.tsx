"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductManagementTab from '@features/stock/MenuManagementPage/components/ProductManagementTab';
import CategoryManagementTab from '@features/stock/MenuManagementPage/components/CategoryManagementTab';
import RecipeCheckTab from './RecipeCheckTab';
import { useProducts } from '@features/products/hooks/useProducts';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, FolderTree, ChefHat, Info, LayoutGrid } from 'lucide-react';

const MenuManagementTab: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subtabFromUrl = searchParams.get('subtab') as 'products' | 'categories' | 'recipes' | null;

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'categories' | 'recipes'>(() => {
    return (subtabFromUrl && ['products', 'categories', 'recipes'].includes(subtabFromUrl))
      ? subtabFromUrl
      : 'products';
  });

  const isUpdatingFromUrlRef = useRef(false);
  const lastSubtabFromUrlRef = useRef(subtabFromUrl);

  useEffect(() => {
    if (subtabFromUrl === lastSubtabFromUrlRef.current) return;
    lastSubtabFromUrlRef.current = subtabFromUrl;

    if (subtabFromUrl && ['products', 'categories', 'recipes'].includes(subtabFromUrl)) {
      isUpdatingFromUrlRef.current = true;
      setActiveSubTab(subtabFromUrl);
      requestAnimationFrame(() => isUpdatingFromUrlRef.current = false);
    }
  }, [subtabFromUrl]);

  useEffect(() => {
    if (isUpdatingFromUrlRef.current) return;
    if (subtabFromUrl !== activeSubTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('subtab', activeSubTab);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [activeSubTab, subtabFromUrl, searchParams, setSearchParams]);

  const { products, categories, isLoading } = useProducts();

  const stats = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    const safeCategories = Array.isArray(categories) ? categories : [];

    const totalProducts = safeProducts.length;
    const availableProducts = safeProducts.filter(p => p.isAvailable !== false).length;
    const unavailableProducts = totalProducts - availableProducts;
    const totalCategories = safeCategories.length;

    return { totalProducts, availableProducts, unavailableProducts, totalCategories };
  }, [products, categories]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sản Phẩm', val: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Đang Bán', val: stats.availableProducts, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Ngừng Bán', val: stats.unavailableProducts, icon: Package, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Danh Mục', val: stats.totalCategories, icon: FolderTree, color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm bg-white/60 backdrop-blur-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{item.val}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tab System */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <Tabs
          value={activeSubTab}
          onValueChange={(v) => setActiveSubTab(v as any)}
          className="w-full"
        >
          <div className="px-6 pt-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Quản lý Thực đơn</h3>
                  <p className="text-xs text-slate-500">Thiết lập món ăn, giá bán và cấu hình danh mục</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white px-3 py-1 font-medium">
                {isLoading ? 'Đang đồng bộ...' : 'Hệ thống sẵn sàng'}
              </Badge>
            </div>

            <TabsList className="bg-transparent h-auto p-0 gap-6">
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 font-bold text-sm text-slate-400 transition-all flex gap-2 items-center"
              >
                <Package className="w-4 h-4" /> Sản Phẩm
                <span className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500">{stats.totalProducts}</span>
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 font-bold text-sm text-slate-400 transition-all flex gap-2 items-center"
              >
                <FolderTree className="w-4 h-4" /> Danh Mục
                <span className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500">{stats.totalCategories}</span>
              </TabsTrigger>
              <TabsTrigger
                value="recipes"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 font-bold text-sm text-slate-400 transition-all flex gap-2 items-center"
              >
                <ChefHat className="w-4 h-4" /> Kiểm Tra Công Thức
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-6">
            <TabsContent value="products" className="mt-0 focus-visible:ring-0">
              <ProductManagementTab />
            </TabsContent>
            <TabsContent value="categories" className="mt-0 focus-visible:ring-0">
              <CategoryManagementTab />
            </TabsContent>
            <TabsContent value="recipes" className="mt-0 focus-visible:ring-0">
              <RecipeCheckTab />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Help Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-primary/30" />
        <div className="flex items-center gap-6 z-10">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
            <Info className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-bold">Mẹo Quản Lý:</h4>
            <p className="text-slate-400 text-sm max-w-md">Bạn có thể kéo thả để sắp xếp thứ tự hiển thị của các món ăn trong POS menu tại trang cấu hình chi tiết.</p>
          </div>
        </div>
        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold z-10">
          Xem hướng dẫn <ChefHat className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default React.memo(MenuManagementTab);
