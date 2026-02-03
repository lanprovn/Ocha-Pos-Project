import React, { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useIngredients } from '@features/stock/context/IngredientContext';
import StockAdjustModal from '@features/stock/components/StockAdjustModal';
import AddStockModal, { type StockFormData } from '@features/stock/components/AddStockModal';
import IngredientFormModal, { type IngredientFormValues } from '@features/stock/components/IngredientFormModal';
import { StatsCards } from '@features/stock/StockManagementPage/components/StatsCards';
import { StockTabs } from '@features/stock/StockManagementPage/components/StockTabs';
import { StocksTab } from '@features/stock/StockManagementPage/components/StocksTab';
import { TransactionsTab } from '@features/stock/StockManagementPage/components/TransactionsTab';
import { AlertsTab } from '@features/stock/StockManagementPage/components/AlertsTab';
import { IngredientsTab } from '@features/stock/StockManagementPage/components/IngredientsTab';
import { useStockManagement } from '@features/stock/StockManagementPage/hooks/useStockManagement';
import { useStockModal } from '@features/stock/StockManagementPage/hooks/useStockModal';
import { useStockFilters } from '@features/stock/StockManagementPage/hooks/useStockFilters';
import stockService from '@features/stock/services/stock.service';
import type { IngredientStock } from '@/utils/ingredientManagement';
import { useProducts } from '@features/products/hooks/useProducts';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Box,
  History,
  AlertCircle,
  Settings2,
  ArrowUpRight,
  Plus,
  Search,
  LayoutGrid,
  ClipboardList
} from 'lucide-react';

const StockManagementTab: React.FC = () => {
  const {
    ingredients = [],
    alerts: ingredientAlerts = [],
    markAlertAsRead: markIngredientAlertAsRead,
  } = useIngredients();

  const { loadProducts } = useProducts();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const [isAddStockModalOpen, setAddStockModalOpen] = useState(false);
  const [isSavingStock, setIsSavingStock] = useState(false);

  const [isIngredientFormOpen, setIngredientFormOpen] = useState(false);
  const [ingredientFormMode, setIngredientFormMode] = useState<'create' | 'edit'>('create');
  const [editingIngredient, setEditingIngredient] = useState<IngredientStock | null>(null);
  const [isSavingIngredient, setIsSavingIngredient] = useState(false);

  const openAddStockModal = () => setAddStockModalOpen(true);

  const openCreateIngredientForm = () => {
    setIngredientFormMode('create');
    setEditingIngredient(null);
    setIngredientFormOpen(true);
  };

  const openEditIngredientForm = (ingredient: IngredientStock) => {
    setIngredientFormMode('edit');
    setEditingIngredient(ingredient);
    setIngredientFormOpen(true);
  };

  const handleAddStock = async (productId: string, stockData: StockFormData) => {
    try {
      setIsSavingStock(true);
      await stockService.createProductStock({
        productId,
        quantity: stockData.quantity,
        minStock: stockData.minStock,
        maxStock: stockData.maxStock,
        unit: stockData.unit,
        isActive: stockData.isActive,
      });
      toast.success('Đã thiết lập tồn kho thành công');
      await reloadData();
    } catch (error: any) {
      throw error;
    } finally {
      setIsSavingStock(false);
    }
  };

  const ingredientInitialValues = useMemo<Partial<IngredientFormValues> | undefined>(() => {
    if (!editingIngredient) return undefined;
    return {
      ingredientId: editingIngredient.id,
      stockId: editingIngredient.stockId,
      name: editingIngredient.name,
      unit: editingIngredient.unit,
      quantity: editingIngredient.currentStock,
      minStock: editingIngredient.minStock,
      maxStock: editingIngredient.maxStock,
    };
  }, [editingIngredient]);

  const {
    stocks,
    transactions,
    alerts,
    isLoading,
    activeTab: stockActiveTab,
    setActiveTab: setStockActiveTab,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    lowStockCount,
    outOfStockCount,
    reloadData,
    reloadIngredients,
  } = useStockManagement();

  const {
    filteredStocks,
    filteredIngredients,
    filteredTransactions,
    getCategories,
    getProductInfo,
  } = useStockFilters(stocks, transactions, ingredients, filter, categoryFilter, searchQuery);

  const {
    showModal,
    selectedProduct,
    selectedIngredient,
    handleOpenModal,
    handleCloseModal,
    handleConfirm,
  } = useStockModal(reloadData, reloadIngredients);

  const unreadAlertsCount = alerts.filter((alert) => !alert.isRead).length;
  const unreadIngredientAlertsCount = ingredientAlerts.filter((alert) => !alert.isRead).length;
  const totalAlerts = unreadAlertsCount + unreadIngredientAlertsCount;

  const handleSaveIngredient = async (values: IngredientFormValues) => {
    try {
      setIsSavingIngredient(true);
      if (ingredientFormMode === 'create') {
        await stockService.createIngredient({
          name: values.name,
          unit: values.unit,
          quantity: values.quantity,
          minStock: values.minStock,
          maxStock: values.maxStock,
          isActive: values.isActive,
        });
        toast.success('Đã thêm nguyên liệu mới');
      } else {
        const targetStockId = values.stockId || editingIngredient?.stockId;
        if (!targetStockId) throw new Error('Không tìm thấy bản ghi tồn kho');
        await stockService.updateIngredientStock(targetStockId, {
          name: values.name,
          unit: values.unit,
          quantity: values.quantity,
          minStock: values.minStock,
          maxStock: values.maxStock,
          isActive: values.isActive,
        });
        toast.success('Đã cập nhật nguyên liệu');
      }
      setIngredientFormOpen(false);
      setEditingIngredient(null);
      await reloadData();
      await reloadIngredients();
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi lưu dữ liệu');
    } finally {
      setIsSavingIngredient(false);
    }
  };

  const handleDeleteIngredient = async () => {
    if (!editingIngredient) return;
    try {
      setIsSavingIngredient(true);
      await stockService.deleteIngredient(editingIngredient.id);
      toast.success('Đã xóa nguyên liệu');
      setIngredientFormOpen(false);
      setEditingIngredient(null);
      await reloadIngredients();
      await reloadData();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể xóa');
    } finally {
      setIsSavingIngredient(false);
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await stockService.markAlertAsRead(alertId);
      reloadData();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái đã đọc');
    }
  };

  const handleMarkIngredientAlertAsRead = (alertId: string) => {
    markIngredientAlertAsRead(alertId);
    reloadIngredients();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Đang kiểm kê kho hàng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Kho Hàng & Nguyên Liệu</h2>
          <p className="text-slate-500 text-sm">Theo dõi lượng tồn kho, nhập hàng và cảnh báo thông minh</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openAddStockModal} className="border-slate-200 font-bold">
            <Box className="w-4 h-4 mr-2" /> Thiết lập tồn kho
          </Button>
          <Button onClick={openCreateIngredientForm} className="bg-primary hover:bg-primary-hover shadow-lg font-bold">
            <Plus className="w-4 h-4 mr-2" /> Thêm nguyên liệu
          </Button>
        </div>
      </div>

      {/* Modern Stock Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sản Phẩm Trong Kho', val: stocks.length, icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Đủ Lượng Tồn', val: stocks.filter(s => s.currentStock > s.minStock).length, icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sắp Hết Hàng', val: lowStockCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Hết Hàng', val: outOfStockCount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' }
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

      {/* Main Stock Tab System */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <Tabs value={stockActiveTab} onValueChange={(v) => setStockActiveTab(v as any)} className="w-full">
          <div className="px-6 pt-6 bg-slate-50/40 border-b border-slate-100">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              {[
                { id: 'stocks', name: 'Mặt Hàng', icon: Box, count: stocks.length },
                { id: 'ingredients', name: 'Nguyên Liệu', icon: Settings2, count: ingredients.length },
                { id: 'transactions', name: 'Lịch Sử Nhập/Xuất', icon: History, count: transactions.length },
                { id: 'alerts', name: 'Cảnh Báo', icon: AlertCircle, count: totalAlerts, color: totalAlerts > 0 ? 'text-rose-500' : '' }
              ].map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-4 font-bold text-sm text-slate-400 transition-all flex gap-2 items-center relative"
                >
                  <tab.icon className={cn("w-4 h-4", tab.color)} />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={cn(
                      "ml-1 px-1.5 py-0.5 rounded text-[10px] font-black",
                      tab.id === 'alerts' && totalAlerts > 0 ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <CardContent className="p-6">
            <TabsContent value="stocks" className="mt-0 focus-visible:ring-0">
              <StocksTab
                filteredStocks={filteredStocks}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                lowStockCount={lowStockCount}
                outOfStockCount={outOfStockCount}
                getCategories={getCategories}
                getProductInfo={getProductInfo}
                onOpenAdjustModal={handleOpenModal}
                onAddStock={openAddStockModal}
              />
            </TabsContent>

            <TabsContent value="transactions" className="mt-0 focus-visible:ring-0">
              <TransactionsTab
                filteredTransactions={filteredTransactions}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                getProductInfo={getProductInfo}
              />
            </TabsContent>

            <TabsContent value="alerts" className="mt-0 focus-visible:ring-0">
              <AlertsTab
                alerts={alerts}
                ingredientAlerts={ingredientAlerts}
                ingredients={ingredients}
                getProductInfo={getProductInfo}
                handleMarkAlertAsRead={handleMarkAlertAsRead}
                handleMarkIngredientAlertAsRead={handleMarkIngredientAlertAsRead}
              />
            </TabsContent>

            <TabsContent value="ingredients" className="mt-0 focus-visible:ring-0">
              <IngredientsTab
                filteredIngredients={filteredIngredients}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
                ingredientStats={{
                  lowStock: lowStockCount,
                  outOfStock: outOfStockCount,
                  total: Array.isArray(ingredients) ? ingredients.length : 0,
                }}
                onOpenAdjustModal={(p, i) => handleOpenModal(p, i)}
                onCreateIngredient={openCreateIngredientForm}
                onEditIngredient={openEditIngredientForm}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Footer Hint */}
      <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <ClipboardList className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-xs text-blue-700 font-medium">
          Hệ thống tự động đồng bộ tồn kho mỗi 30 giây. Các giao dịch từ máy POS sẽ được cập nhật trực tiếp vào Lịch Sử Nhập/Xuất.
        </p>
      </div>

      {/* Modals */}
      <StockAdjustModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        product={selectedProduct || null}
        ingredient={selectedIngredient || null}
      />

      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setAddStockModalOpen(false)}
        onSubmit={handleAddStock}
        existingStocks={stocks}
        loading={isSavingStock}
      />

      <IngredientFormModal
        isOpen={isIngredientFormOpen}
        mode={ingredientFormMode}
        onClose={() => {
          setIngredientFormOpen(false);
          setEditingIngredient(null);
        }}
        onSubmit={handleSaveIngredient}
        onDelete={ingredientFormMode === 'edit' ? handleDeleteIngredient : undefined}
        initialValues={ingredientInitialValues}
        loading={isSavingIngredient}
      />
    </div>
  );
};

export default React.memo(StockManagementTab);
