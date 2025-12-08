import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useIngredients } from '../../../context/IngredientContext';
import StockAdjustModal from '../../../components/features/stock/StockAdjustModal';
import ProductFormModal, { type ProductFormValues } from '../../../components/features/stock/ProductFormModal';
import IngredientFormModal, { type IngredientFormValues } from '../../../components/features/stock/IngredientFormModal';
import { StatsCards } from '../../StockManagementPage/components/StatsCards';
import { StockTabs } from '../../StockManagementPage/components/StockTabs';
import { StocksTab } from '../../StockManagementPage/components/StocksTab';
import { TransactionsTab } from '../../StockManagementPage/components/TransactionsTab';
import { AlertsTab } from '../../StockManagementPage/components/AlertsTab';
import { IngredientsTab } from '../../StockManagementPage/components/IngredientsTab';
import { useStockManagement } from '../../StockManagementPage/hooks/useStockManagement';
import { useStockModal } from '../../StockManagementPage/hooks/useStockModal';
import { useStockFilters } from '../../StockManagementPage/hooks/useStockFilters';
import stockService from '../../../services/stock.service.ts';
import { productService } from '../../../services/product.service.ts';
import type { StockProduct } from '../../../services/stock.service.ts';
import type { IngredientStock } from '../../../utils/ingredientManagement';
import { useProducts } from '../../../hooks/useProducts';

const StockManagementTab: React.FC = () => {
  const {
    ingredients = [],
    alerts: ingredientAlerts = [],
    markAlertAsRead: markIngredientAlertAsRead,
  } = useIngredients();
  
  const { categories: productCategories = [], loadProducts } = useProducts();

  const categoryOptions = useMemo(
    () =>
      (Array.isArray(productCategories) ? productCategories : []).map((category: any) => ({
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

  const handleSaveProduct = async (values: ProductFormValues) => {
    try {
      setIsSavingProduct(true);
      if (productFormMode === 'create') {
        // Create product first, then create stock
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
        // Update product and stock
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
      setProductFormOpen(false);
      setEditingProduct(null);
      await reloadData();
      await loadProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error?.message || 'Không thể lưu sản phẩm');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingProduct) return;
    try {
      setIsSavingProduct(true);
      await productService.delete(editingProduct.productId);
      toast.success('Đã xóa sản phẩm');
      setProductFormOpen(false);
      setEditingProduct(null);
      await reloadData();
      await loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error?.message || 'Không thể xóa sản phẩm');
    } finally {
      setIsSavingProduct(false);
    }
  };

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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="p-6">
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
              onCreateProduct={openCreateProductForm}
              onEditProduct={openEditProductForm}
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
        onSubmit={handleConfirm}
        data={selectedProduct || selectedIngredient}
      />

      <ProductFormModal
        isOpen={isProductFormOpen}
        mode={productFormMode}
        onClose={() => {
          setProductFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        onDelete={productFormMode === 'edit' ? handleDeleteProduct : undefined}
        initialValues={productInitialValues}
        categories={categoryOptions}
        loading={isSavingProduct}
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

