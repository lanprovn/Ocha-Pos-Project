"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { productService } from '@features/products/services/product.service';
import recipeService, { type CreateRecipeInput } from '@features/stock/services/recipe.service';
import { useProducts } from '@features/products/hooks/useProducts';
import { useIngredients } from '@features/stock/context/IngredientContext';
import toast from 'react-hot-toast';
import type { Product } from '@/types/product';
import type { RecipeItem } from '@features/stock/services/recipe.service';

interface ProductWithRecipe extends Product {
  hasRecipe: boolean;
  recipeCount: number;
  recipes?: RecipeItem[];
}

const RecipeCheckTab: React.FC = () => {
  const { products, loadProducts } = useProducts();
  const { ingredients } = useIngredients();
  const [isLoading, setIsLoading] = useState(true);
  const [productsWithRecipes, setProductsWithRecipes] = useState<ProductWithRecipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'with_recipe' | 'without_recipe'>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRecipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecipes, setNewRecipes] = useState<CreateRecipeInput[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [autoCreateProgress, setAutoCreateProgress] = useState({ current: 0, total: 0 });
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const checkRecipes = async () => {
      if (products.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const productsData: ProductWithRecipe[] = await Promise.all(
          products.map(async (product) => {
            try {
              const productId = String(product.id);
              const recipes = await recipeService.getByProduct(productId);
              return {
                ...product,
                hasRecipe: recipes.length > 0,
                recipeCount: recipes.length,
                recipes: recipes,
              };
            } catch (error) {
              console.error(`Error loading recipes for product ${product.id}:`, error);
              return {
                ...product,
                hasRecipe: false,
                recipeCount: 0,
                recipes: [],
              };
            }
          })
        );

        setProductsWithRecipes(productsData);
      } catch (error) {
        console.error('Error checking recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRecipes();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = productsWithRecipes;

    // Filter by recipe status
    if (filter === 'with_recipe') {
      filtered = filtered.filter((p) => p.hasRecipe);
    } else if (filter === 'without_recipe') {
      filtered = filtered.filter((p) => !p.hasRecipe);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (typeof p.category === 'string' ? p.category.toLowerCase().includes(query) : false) ||
          String(p.id).toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [productsWithRecipes, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = productsWithRecipes.length;
    const withRecipe = productsWithRecipes.filter((p) => p.hasRecipe).length;
    const withoutRecipe = total - withRecipe;
    return { total, withRecipe, withoutRecipe };
  }, [productsWithRecipes]);

  // Function to get default recipes based on category
  const getDefaultRecipesForProduct = (product: ProductWithRecipe): CreateRecipeInput[] => {
    const categoryName = (typeof product.category === 'string' ? product.category : '').toLowerCase();
    const productName = product.name.toLowerCase();
    const productId = String(product.id); // Ensure it's a string
    const defaultRecipes: CreateRecipeInput[] = [];

    // Find ingredients by name (fuzzy match)
    const findIngredient = (keywords: string[]): string | null => {
      for (const keyword of keywords) {
        const found = ingredients.find((ing) =>
          ing.name.toLowerCase().includes(keyword.toLowerCase())
        );
        if (found) return found.id;
      }
      return null;
    };

    // Template recipes based on category
    if (categoryName.includes('cà phê') || categoryName.includes('ca phe') || productName.includes('cà phê') || productName.includes('ca phe')) {
      // Coffee products
      const coffeeId = findIngredient(['cà phê', 'ca phe', 'coffee']);
      const sugarId = findIngredient(['đường', 'duong', 'sugar']);
      const milkId = findIngredient(['sữa', 'sua', 'milk']);
      
      if (coffeeId) defaultRecipes.push({ productId, ingredientId: coffeeId, quantity: 20, unit: 'g' });
      if (sugarId) defaultRecipes.push({ productId, ingredientId: sugarId, quantity: 10, unit: 'g' });
      if (milkId && (productName.includes('sữa') || productName.includes('latte') || productName.includes('cappuccino'))) {
        defaultRecipes.push({ productId, ingredientId: milkId, quantity: 200, unit: 'ml' });
      }
    } else if (categoryName.includes('trà') || categoryName.includes('tra') || productName.includes('trà') || productName.includes('tra')) {
      // Tea products
      const teaId = findIngredient(['trà', 'tra', 'tea']);
      const sugarId = findIngredient(['đường', 'duong', 'sugar']);
      const honeyId = findIngredient(['mật ong', 'mat ong', 'honey']);
      
      if (teaId) defaultRecipes.push({ productId, ingredientId: teaId, quantity: 5, unit: 'g' });
      if (sugarId) defaultRecipes.push({ productId, ingredientId: sugarId, quantity: 15, unit: 'g' });
      if (honeyId && productName.includes('mật')) {
        defaultRecipes.push({ productId, ingredientId: honeyId, quantity: 20, unit: 'ml' });
      }
    } else if (categoryName.includes('bánh') || categoryName.includes('banh') || productName.includes('bánh') || productName.includes('banh')) {
      // Cake/Dessert products
      const flourId = findIngredient(['bột', 'bot', 'flour']);
      const sugarId = findIngredient(['đường', 'duong', 'sugar']);
      const eggId = findIngredient(['trứng', 'trung', 'egg']);
      const butterId = findIngredient(['bơ', 'bo', 'butter']);
      
      if (flourId) defaultRecipes.push({ productId, ingredientId: flourId, quantity: 100, unit: 'g' });
      if (sugarId) defaultRecipes.push({ productId, ingredientId: sugarId, quantity: 50, unit: 'g' });
      if (eggId) defaultRecipes.push({ productId, ingredientId: eggId, quantity: 2, unit: 'cái' });
      if (butterId) defaultRecipes.push({ productId, ingredientId: butterId, quantity: 30, unit: 'g' });
    } else if (categoryName.includes('đồ uống') || categoryName.includes('do uong') || productName.includes('nước') || productName.includes('nuoc')) {
      // Beverages
      const waterId = findIngredient(['nước', 'nuoc', 'water']);
      const sugarId = findIngredient(['đường', 'duong', 'sugar']);
      const iceId = findIngredient(['đá', 'da', 'ice']);
      
      if (waterId) defaultRecipes.push({ productId, ingredientId: waterId, quantity: 300, unit: 'ml' });
      if (sugarId) defaultRecipes.push({ productId, ingredientId: sugarId, quantity: 20, unit: 'g' });
      if (iceId && (productName.includes('đá') || productName.includes('lạnh') || productName.includes('ice'))) {
        defaultRecipes.push({ productId, ingredientId: iceId, quantity: 100, unit: 'g' });
      }
    } else {
      // Default: try to find common ingredients
      const waterId = findIngredient(['nước', 'nuoc', 'water']);
      const sugarId = findIngredient(['đường', 'duong', 'sugar']);
      
      if (waterId) defaultRecipes.push({ productId, ingredientId: waterId, quantity: 200, unit: 'ml' });
      if (sugarId) defaultRecipes.push({ productId, ingredientId: sugarId, quantity: 15, unit: 'g' });
    }

    return defaultRecipes.filter((r) => r.ingredientId); // Only return recipes with valid ingredients
  };

  // Auto-create recipes for all products without recipes
  const handleAutoCreateAllRecipes = async () => {
    const productsWithoutRecipes = productsWithRecipes.filter((p) => !p.hasRecipe);
    
    if (productsWithoutRecipes.length === 0) {
      toast.success('Tất cả sản phẩm đã có công thức!');
      return;
    }

    if (!confirm(`Bạn có chắc muốn tự động tạo công thức cho ${productsWithoutRecipes.length} sản phẩm chưa có công thức?`)) {
      return;
    }

    setIsAutoCreating(true);
    setAutoCreateProgress({ current: 0, total: productsWithoutRecipes.length });

    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < productsWithoutRecipes.length; i++) {
        const product = productsWithoutRecipes[i];
        setAutoCreateProgress({ current: i + 1, total: productsWithoutRecipes.length });

        const defaultRecipes = getDefaultRecipesForProduct(product);
        
        if (defaultRecipes.length === 0) {
          console.warn(`Không tìm thấy nguyên liệu phù hợp cho sản phẩm: ${product.name}`);
          failCount++;
          continue;
        }

        try {
          // ✅ OPTIMIZED: Create all recipes for this product in parallel
          await Promise.all(defaultRecipes.map(recipe => recipeService.create(recipe)));
          successCount++;
        } catch (error) {
          console.error(`Error creating recipes for ${product.name}:`, error);
          failCount++;
        }
      }

      // Reload data
      const updated = await Promise.all(
        products.map(async (product) => {
          try {
            const productId = String(product.id);
            const recipes = await recipeService.getByProduct(productId);
            return {
              ...product,
              hasRecipe: recipes.length > 0,
              recipeCount: recipes.length,
              recipes: recipes,
            };
          } catch (error) {
            return {
              ...product,
              hasRecipe: false,
              recipeCount: 0,
              recipes: [],
            };
          }
        })
      );
      setProductsWithRecipes(updated);

      toast.success(
        `Đã tạo công thức cho ${successCount} sản phẩm${failCount > 0 ? `, ${failCount} sản phẩm không thể tạo (thiếu nguyên liệu)` : ''}`
      );
    } catch (error) {
      console.error('Error auto-creating recipes:', error);
      toast.error('Có lỗi xảy ra khi tạo công thức tự động');
    } finally {
      setIsAutoCreating(false);
      setAutoCreateProgress({ current: 0, total: 0 });
    }
  };

  // Delete all recipes for all products
  const handleDeleteAllRecipes = async () => {
    const productsToDelete = productsWithRecipes.filter((p) => p.hasRecipe);
    
    if (productsToDelete.length === 0) {
      toast('Không có công thức nào để xóa!');
      return;
    }

    const confirmMessage = `⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ công thức của ${productsToDelete.length} sản phẩm?\n\nHành động này KHÔNG THỂ hoàn tác!`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Double confirmation
    const doubleConfirm = prompt('Để xác nhận, vui lòng nhập "XÓA TẤT CẢ" (chữ hoa):');
    if (doubleConfirm !== 'XÓA TẤT CẢ') {
      toast.error('Xác nhận không đúng. Đã hủy thao tác.');
      return;
    }

    setIsDeletingAll(true);
    setAutoCreateProgress({ current: 0, total: productsToDelete.length });

    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < productsToDelete.length; i++) {
        const product = productsToDelete[i];
        setAutoCreateProgress({ current: i + 1, total: productsToDelete.length });

        if (!product.recipes || product.recipes.length === 0) {
          continue;
        }

        try {
          // Delete all recipes for this product
          for (const recipe of product.recipes) {
            await recipeService.delete(recipe.id);
          }
          successCount++;
        } catch (error) {
          console.error(`Error deleting recipes for ${product.name}:`, error);
          failCount++;
        }
      }

      // Reload data
      const updated = await Promise.all(
        products.map(async (product) => {
          try {
            const productId = String(product.id);
            const recipes = await recipeService.getByProduct(productId);
            return {
              ...product,
              hasRecipe: recipes.length > 0,
              recipeCount: recipes.length,
              recipes: recipes,
            };
          } catch (error) {
            return {
              ...product,
              hasRecipe: false,
              recipeCount: 0,
              recipes: [],
            };
          }
        })
      );
      setProductsWithRecipes(updated);

      toast.success(
        `Đã xóa công thức của ${successCount} sản phẩm${failCount > 0 ? `, ${failCount} sản phẩm có lỗi` : ''}`
      );
    } catch (error) {
      console.error('Error deleting all recipes:', error);
      toast.error('Có lỗi xảy ra khi xóa công thức');
    } finally {
      setIsDeletingAll(false);
      setAutoCreateProgress({ current: 0, total: 0 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang kiểm tra công thức...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Tổng Sản Phẩm</p>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-3 shadow-sm">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Có Công Thức</p>
              <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.withRecipe}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-3 shadow-sm">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Chưa Có Công Thức</p>
              <p className="text-3xl font-bold text-red-600 mb-1">{stats.withoutRecipe}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 shadow-sm">
              <XCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setFilter('with_recipe')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'with_recipe'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Có Công Thức
            </button>
            <button
              onClick={() => setFilter('without_recipe')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'without_recipe'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Chưa Có
            </button>
            {stats.withoutRecipe > 0 && (
              <button
                onClick={handleAutoCreateAllRecipes}
                disabled={isAutoCreating || isDeletingAll}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                {isAutoCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Đang tạo ({autoCreateProgress.current}/{autoCreateProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    <span>Tự Động Tạo Cho Tất Cả ({stats.withoutRecipe})</span>
                  </>
                )}
              </button>
            )}
            {stats.withRecipe > 0 && (
              <button
                onClick={handleDeleteAllRecipes}
                disabled={isDeletingAll || isAutoCreating}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                {isDeletingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Đang xóa ({autoCreateProgress.current}/{autoCreateProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4" />
                    <span>Xóa Hết Công Thức ({stats.withRecipe})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sản Phẩm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Danh Mục</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Trạng Thái</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Số Nguyên Liệu</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Chi Tiết</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">ID: {String(product.id).slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {typeof product.category === 'string' ? product.category : 'Không có danh mục'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.hasRecipe ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Có công thức
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Chưa có
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-900">
                        {product.recipeCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.hasRecipe && product.recipes && product.recipes.length > 0 ? (
                        <div className="text-xs text-slate-600">
                          {product.recipes.slice(0, 2).map((recipe) => (
                            <div key={recipe.id} className="mb-1">
                              • {recipe.ingredient.name} ({recipe.quantity} {recipe.unit})
                            </div>
                          ))}
                          {product.recipes.length > 2 && (
                            <div className="text-slate-400">+{product.recipes.length - 2} nguyên liệu khác</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa có nguyên liệu</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!product.hasRecipe && (
                        <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setNewRecipes([{
                            productId: String(product.id),
                            ingredientId: '',
                            quantity: 0,
                            unit: 'g',
                          }]);
                          setIsModalOpen(true);
                        }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          Thêm Công Thức
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Recipe Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full md:w-[90%] lg:w-[80%] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Thêm Công Thức cho: {selectedProduct.name}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedProduct(null);
                  setNewRecipes([]);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {newRecipes.map((recipe, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 bg-slate-50 rounded-lg">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nguyên liệu
                    </label>
                    <select
                      value={recipe.ingredientId}
                      onChange={(e) => {
                        const ingredient = ingredients.find((i) => i.id === e.target.value);
                        const updated = [...newRecipes];
                        updated[index] = {
                          ...recipe,
                          ingredientId: e.target.value,
                          unit: ingredient?.unit || 'g',
                        };
                        setNewRecipes(updated);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn nguyên liệu</option>
                      {ingredients.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={recipe.quantity || ''}
                      onChange={(e) => {
                        const updated = [...newRecipes];
                        updated[index] = {
                          ...recipe,
                          quantity: parseFloat(e.target.value) || 0,
                        };
                        setNewRecipes(updated);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Đơn vị
                    </label>
                    <input
                      type="text"
                      value={recipe.unit}
                      onChange={(e) => {
                        const updated = [...newRecipes];
                        updated[index] = {
                          ...recipe,
                          unit: e.target.value,
                        };
                        setNewRecipes(updated);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    {newRecipes.length > 1 && (
                      <button
                        onClick={() => {
                          setNewRecipes(newRecipes.filter((_, i) => i !== index));
                        }}
                        className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  setNewRecipes([
                    ...newRecipes,
                    {
                      productId: String(selectedProduct.id), // Convert number to string
                      ingredientId: '',
                      quantity: 0,
                      unit: 'g',
                    },
                  ]);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Thêm Nguyên Liệu
              </button>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedProduct(null);
                  setNewRecipes([]);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  const validRecipes = newRecipes.filter(
                    (r) => r.ingredientId && r.quantity > 0
                  );

                  if (validRecipes.length === 0) {
                    toast.error('Vui lòng thêm ít nhất một nguyên liệu hợp lệ');
                    return;
                  }

                  setIsSaving(true);
                  try {
                    for (const recipe of validRecipes) {
                      await recipeService.create(recipe);
                    }
                    toast.success(`Đã thêm ${validRecipes.length} nguyên liệu vào công thức`);
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                    setNewRecipes([]);
                    // Reload data
                    const updated = await Promise.all(
                      products.map(async (product) => {
                        try {
                          const recipes = await recipeService.getByProduct(String(product.id));
                          return {
                            ...product,
                            hasRecipe: recipes.length > 0,
                            recipeCount: recipes.length,
                            recipes: recipes,
                          };
                        } catch (error) {
                          return {
                            ...product,
                            hasRecipe: false,
                            recipeCount: 0,
                            recipes: [],
                          };
                        }
                      })
                    );
                    setProductsWithRecipes(updated);
                  } catch (error: any) {
                    console.error('Error saving recipes:', error);
                    toast.error(error?.response?.data?.error || 'Không thể lưu công thức');
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu Công Thức'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 text-xl">💡</div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Lưu ý về Công Thức</h4>
            <p className="text-sm text-blue-700">
              Sản phẩm có công thức sẽ tự động trừ nguyên liệu khi đơn hàng được hoàn thành. 
              Để thêm công thức cho sản phẩm, vui lòng chỉnh sửa sản phẩm trong phần Quản Lý Menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCheckTab;

