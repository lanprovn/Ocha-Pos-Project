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
import type { StockProduct } from '@features/stock/services/stock.service';
import type { IngredientStock } from '@/utils/ingredientManagement';
import { useProducts } from '@features/products/hooks/useProducts';

const StockManagementTab: React.FC = () => {
  const {
    ingredients = [],
    alerts: ingredientAlerts = [],
    markAlertAsRead: markIngredientAlertAsRead,
  } = useIngredients();
  
  const { loadProducts } = useProducts();

  // Load products on mount to ensure product names are available
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const [isAddStockModalOpen, setAddStockModalOpen] = useState(false);
  const [isSavingStock, setIsSavingStock] = useState(false);

  const [isIngredientFormOpen, setIngredientFormOpen] = useState(false);
  const [ingredientFormMode, setIngredientFormMode] = useState<'create' | 'edit'>('create');
  const [editingIngredient, setEditingIngredient] = useState<IngredientStock | null>(null);
  const [isSavingIngredient, setIsSavingIngredient] = useState(false);

  const openAddStockModal = () => {
    setAddStockModalOpen(true);
  };

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
      toast.success('Đã thêm tồn kho cho sản phẩm');
      await reloadData();
    } catch (error: any) {
      console.error('Error adding stock:', error);
      throw error; // Re-throw để AddStockModal xử lý
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
    forceAdjustMode,
    handleOpenModal,
    handleCloseModal,
    handleConfirm,
  } = useStockModal(reloadData, reloadIngredients);

  const unreadAlertsCount = alerts.filter((alert) => !alert.isRead).length;
  const unreadIngredientAlertsCount = ingredientAlerts.filter((alert) => !alert.isRead).length;


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
        if (!targetStockId) {
          throw new Error('Không tìm thấy bản ghi tồn kho để cập nhật');
        }
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
      console.error('Error saving ingredient:', error);
      toast.error(error?.message || 'Không thể lưu nguyên liệu');
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
      console.error('Error deleting ingredient:', error);
      toast.error(error?.message || 'Không thể xóa nguyên liệu');
    } finally {
      setIsSavingIngredient(false);
    }
  };

  const stats = {
    totalProducts: stocks.length,
    inStock: stocks.filter(s => s.currentStock > s.minStock).length,
    lowStock: lowStockCount,
    outOfStock: outOfStockCount,
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await stockService.markAlertAsRead(alertId);
      reloadData();
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Không thể đánh dấu cảnh báo đã đọc. Vui lòng thử lại.');
    }
  };

  const handleMarkIngredientAlertAsRead = (alertId: string) => {
    markIngredientAlertAsRead(alertId);
    reloadIngredients();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải dữ liệu tồn kho...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <StatsCards
        totalProducts={stats.totalProducts}
        inStock={stats.inStock}
        lowStock={stats.lowStock}
        outOfStock={stats.outOfStock}
      />

      {/* Stock Tabs */}
      <StockTabs
        activeTab={stockActiveTab}
        onTabChange={setStockActiveTab}
        stocksCount={stocks.length}
        transactionsCount={transactions.length}
        alertsCount={unreadAlertsCount + unreadIngredientAlertsCount}
        ingredientsCount={Array.isArray(ingredients) ? ingredients.length : 0}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-5">
          {stockActiveTab === 'stocks' && (
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
              onOpenAdjustModal={(product) => handleOpenModal(product)}
              onAddStock={openAddStockModal}
            />
          )}

          {stockActiveTab === 'transactions' && (
            <TransactionsTab
              filteredTransactions={filteredTransactions}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              getProductInfo={getProductInfo}
            />
          )}

          {stockActiveTab === 'alerts' && (
            <AlertsTab
              alerts={alerts}
              ingredientAlerts={ingredientAlerts}
              ingredients={ingredients}
              getProductInfo={getProductInfo}
              handleMarkAlertAsRead={handleMarkAlertAsRead}
              handleMarkIngredientAlertAsRead={handleMarkIngredientAlertAsRead}
            />
          )}

          {stockActiveTab === 'ingredients' && (
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
              onOpenAdjustModal={(product, ingredient) => handleOpenModal(product, ingredient)}
              onCreateIngredient={openCreateIngredientForm}
              onEditIngredient={openEditIngredientForm}
            />
          )}
        </div>
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

