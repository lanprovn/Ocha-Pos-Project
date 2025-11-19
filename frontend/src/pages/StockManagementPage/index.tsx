import React, { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useIngredients } from '../../context/IngredientContext';
import StockAdjustModal from '../../components/features/stock/StockAdjustModal';
import ProductFormModal, { type ProductFormValues } from '../../components/features/stock/ProductFormModal';
import IngredientFormModal, { type IngredientFormValues } from '../../components/features/stock/IngredientFormModal';
import { StockManagementHeader } from './components/StockManagementHeader';
import { StatsCards } from './components/StatsCards';
import { StockTabs } from './components/StockTabs';
import { StocksTab } from './components/StocksTab';
import { TransactionsTab } from './components/TransactionsTab';
import { AlertsTab } from './components/AlertsTab';
import { IngredientsTab } from './components/IngredientsTab';
import { useStockManagement } from './hooks/useStockManagement';
import { useStockModal } from './hooks/useStockModal';
import { useStockFilters } from './hooks/useStockFilters';
import stockService from '@services/stock.service.ts';
import { productService } from '@services/product.service.ts';
import type { StockProduct } from '@services/stock.service.ts';
import type { IngredientStock } from '../../utils/ingredientManagement';
import { useProducts } from '@hooks/useProducts';

const StockManagementPage: React.FC = () => {
  const {
    ingredients,
    alerts: ingredientAlerts,
    markAlertAsRead: markIngredientAlertAsRead,
  } = useIngredients();
  const { categories: productCategories, loadProducts } = useProducts();

  const categoryOptions = useMemo(
    () =>
      (productCategories || []).map((category: any) => ({
        id: String(category.id),
        name: category.name,
      })),
    [productCategories]
  );

  const [isProductFormOpen, setProductFormOpen] = useState(false);
  const [productFormMode, setProductFormMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<StockProduct | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [isIngredientFormOpen, setIngredientFormOpen] = useState(false);
  const [ingredientFormMode, setIngredientFormMode] = useState<'create' | 'edit'>('create');
  const [editingIngredient, setEditingIngredient] = useState<IngredientStock | null>(null);
  const [isSavingIngredient, setIsSavingIngredient] = useState(false);

  const openCreateProductForm = () => {
    setProductFormMode('create');
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const openEditProductForm = (stock: StockProduct) => {
    setProductFormMode('edit');
    setEditingProduct(stock);
    setProductFormOpen(true);
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

  const productInitialValues = useMemo<Partial<ProductFormValues> | undefined>(() => {
    if (!editingProduct) return undefined;
    return {
      productId: editingProduct.productId,
      stockId: editingProduct.id,
      name: editingProduct.product?.name || '',
      price: editingProduct.product?.price ?? 0,
      description: editingProduct.product?.description,
      image: editingProduct.product?.image || undefined,
      categoryId: editingProduct.product?.category?.id || '',
      unit: editingProduct.unit,
      quantity: editingProduct.currentStock,
      minStock: editingProduct.minStock,
      maxStock: editingProduct.maxStock,
      isActive: editingProduct.isActive,
    };
  }, [editingProduct]);

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
      isActive: editingIngredient.isActive,
    };
  }, [editingIngredient]);

  const {
    stocks,
    transactions,
    alerts,
    isLoading,
    activeTab,
    setActiveTab,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    ingredients: ingredientsFromHook,
    ingredientStats,
    lowStockCount,
    outOfStockCount,
    unreadAlertsCount,
    unreadIngredientAlertsCount,
    reloadData,
    reloadIngredients,
  } = useStockManagement();

  // Use ingredients from hook if available, otherwise from context
  const finalIngredients = ingredientsFromHook || ingredients || [];

  // Debug: Log ingredients before filtering
  React.useEffect(() => {
    console.log('📋 StockManagementPage - Ingredients before filter:', {
      ingredientsFromContext: ingredients?.length || 0,
      ingredientsFromHook: ingredientsFromHook?.length || 0,
      finalIngredientsCount: finalIngredients.length,
      sampleIngredients: finalIngredients.slice(0, 3),
      filter: filter,
      searchQuery: searchQuery,
    });
  }, [ingredients, ingredientsFromHook, finalIngredients, filter, searchQuery]);

  const {
    filteredStocks,
    filteredIngredients,
    filteredTransactions,
    getCategories,
    getProductInfo,
  } = useStockFilters(stocks || [], transactions || [], finalIngredients, filter, categoryFilter, searchQuery);

  const {
    showModal,
    selectedProduct,
    selectedIngredient,
    forceAdjustMode,
    handleOpenModal,
    handleCloseModal,
    handleConfirm,
  } = useStockModal(reloadData, reloadIngredients);

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

  const handleSubmitProductForm = async (values: ProductFormValues) => {
    setIsSavingProduct(true);
    try {
      if (productFormMode === 'create') {
        const createdProduct = await productService.create({
          name: values.name,
          price: values.price,
          categoryId: values.categoryId || undefined,
          description: values.description,
          image: values.image,
          isAvailable: values.isActive,
        });

        await stockService.createProductStock({
          productId: createdProduct.id,
          quantity: values.quantity,
          minStock: values.minStock,
          maxStock: values.maxStock,
          unit: values.unit,
          isActive: values.isActive,
        });

        toast.success('Đã thêm sản phẩm mới');
      } else if (editingProduct) {
        await productService.update(editingProduct.productId, {
          name: values.name,
          price: values.price,
          categoryId: values.categoryId || undefined,
          description: values.description,
          image: values.image,
          isAvailable: values.isActive,
        });

        await stockService.updateProductStock(editingProduct.id, {
          quantity: values.quantity,
          minStock: values.minStock,
          maxStock: values.maxStock,
          unit: values.unit,
          isActive: values.isActive,
        });

        toast.success('Đã cập nhật sản phẩm');
      }

      await reloadData();
      await loadProducts();
      setProductFormOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error?.message || 'Không thể lưu sản phẩm');
      throw error;
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingProduct) return;
    setIsSavingProduct(true);
    try {
      await productService.delete(editingProduct.productId);
      toast.success('Đã xóa sản phẩm');
      await reloadData();
      await loadProducts();
      setProductFormOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error?.message || 'Không thể xóa sản phẩm');
      throw error;
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleSubmitIngredientForm = async (values: IngredientFormValues) => {
    setIsSavingIngredient(true);
    try {
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

      await reloadIngredients();
      setIngredientFormOpen(false);
      setEditingIngredient(null);
    } catch (error: any) {
      console.error('Error saving ingredient:', error);
      toast.error(error?.message || 'Không thể lưu nguyên liệu');
      throw error;
    } finally {
      setIsSavingIngredient(false);
    }
  };

  const handleDeleteIngredient = async () => {
    if (!editingIngredient) return;
    setIsSavingIngredient(true);
    try {
      await stockService.deleteIngredient(editingIngredient.id);
      toast.success('Đã xóa nguyên liệu');
      await reloadIngredients();
      setIngredientFormOpen(false);
      setEditingIngredient(null);
    } catch (error: any) {
      console.error('Error deleting ingredient:', error);
      toast.error(error?.message || 'Không thể xóa nguyên liệu');
      throw error;
    } finally {
      setIsSavingIngredient(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu tồn kho...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <StockManagementHeader />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards
          totalProducts={stocks.length}
          inStock={stocks.length - lowStockCount - outOfStockCount}
          lowStock={lowStockCount}
          outOfStock={outOfStockCount}
        />

        <StockTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stocksCount={stocks.length}
          transactionsCount={transactions.length}
          alertsCount={unreadAlertsCount + unreadIngredientAlertsCount}
          ingredientsCount={ingredientStats?.total ?? 0}
        />

        <div className="bg-white rounded-md shadow-sm border border-gray-300 mb-8">
          <div className="p-6">
            {activeTab === 'stocks' && (
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
                onCreateProduct={openCreateProductForm}
                onEditProduct={openEditProductForm}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsTab
                filteredTransactions={filteredTransactions}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                getProductInfo={getProductInfo}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsTab
                alerts={alerts || []}
                ingredientAlerts={ingredientAlerts || []}
                ingredients={ingredients || []}
                getProductInfo={getProductInfo}
                handleMarkAlertAsRead={handleMarkAlertAsRead}
                handleMarkIngredientAlertAsRead={handleMarkIngredientAlertAsRead}
              />
            )}

            {activeTab === 'ingredients' && (
              <IngredientsTab
                filteredIngredients={filteredIngredients || []}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
                ingredientStats={ingredientStats}
                onOpenAdjustModal={handleOpenModal}
                onCreateIngredient={openCreateIngredientForm}
                onEditIngredient={openEditIngredientForm}
              />
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={showModal}
        product={selectedProduct}
        ingredient={selectedIngredient}
        productInfo={selectedProduct ? getProductInfo(selectedProduct.productId) : null}
        forceAdjustMode={forceAdjustMode}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />

      <ProductFormModal
        isOpen={isProductFormOpen}
        mode={productFormMode}
        categories={categoryOptions}
        initialValues={productInitialValues}
        loading={isSavingProduct}
        onClose={() => {
          setProductFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmitProductForm}
        onDelete={productFormMode === 'edit' ? handleDeleteProduct : undefined}
      />

      <IngredientFormModal
        isOpen={isIngredientFormOpen}
        mode={ingredientFormMode}
        initialValues={ingredientInitialValues}
        loading={isSavingIngredient}
        onClose={() => {
          setIngredientFormOpen(false);
          setEditingIngredient(null);
        }}
        onSubmit={handleSubmitIngredientForm}
        onDelete={ingredientFormMode === 'edit' ? handleDeleteIngredient : undefined}
      />
    </div>
  );
};

export default StockManagementPage;
