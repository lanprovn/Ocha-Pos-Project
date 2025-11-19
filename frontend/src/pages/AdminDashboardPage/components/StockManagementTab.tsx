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
        await stockService.createProductStock(values);
        toast.success('Đã tạo tồn kho sản phẩm thành công');
      } else {
        await stockService.updateProductStock(values);
        toast.success('Đã cập nhật tồn kho sản phẩm thành công');
      }
      setProductFormOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu tồn kho sản phẩm');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleSaveIngredient = async (values: IngredientFormValues) => {
    try {
      setIsSavingIngredient(true);
      if (ingredientFormMode === 'create') {
        await stockService.createIngredientStock(values);
        toast.success('Đã tạo tồn kho nguyên liệu thành công');
      } else {
        await stockService.updateIngredientStock(values);
        toast.success('Đã cập nhật tồn kho nguyên liệu thành công');
      }
      setIngredientFormOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu tồn kho nguyên liệu');
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
      <div className="bg-white rounded-md shadow-sm border border-gray-300 mb-8">
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
              isLoading={isLoading}
              onMarkAsRead={async (id) => {
                await stockService.markAlertAsRead(id);
                reloadData();
              }}
            />
          )}

          {stockActiveTab === 'ingredients' && (
            <IngredientsTab
              ingredients={filteredIngredients}
              alerts={ingredientAlerts}
              isLoading={isLoading}
              onAdjust={(ingredient) => handleOpenModal(undefined, ingredient)}
              onEdit={openEditIngredientForm}
              onDelete={async (id) => {
                try {
                  await stockService.deleteIngredientStock(id);
                  toast.success('Đã xóa tồn kho nguyên liệu');
                  reloadIngredients();
                } catch (error: any) {
                  toast.error(error.message || 'Không thể xóa tồn kho');
                }
              }}
              onCreate={openCreateIngredientForm}
              onMarkAlertAsRead={markIngredientAlertAsRead}
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
        onClose={() => {
          setProductFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialValues={productInitialValues}
        categoryOptions={categoryOptions}
        isLoading={isSavingProduct}
      />

      <IngredientFormModal
        isOpen={isIngredientFormOpen}
        onClose={() => {
          setIngredientFormOpen(false);
          setEditingIngredient(null);
        }}
        onSubmit={handleSaveIngredient}
        initialValues={ingredientInitialValues}
        isLoading={isSavingIngredient}
      />
    </div>
  );
};

export default React.memo(StockManagementTab);

