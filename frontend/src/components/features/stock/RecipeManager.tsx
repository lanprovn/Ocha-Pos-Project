import React, { useEffect, useState } from 'react';
import recipeService, { type RecipeItem, type CreateRecipeInput } from '@services/recipe.service';
import { useIngredients } from '@context/IngredientContext';
import toast from 'react-hot-toast';

interface RecipeManagerProps {
  productId: string | undefined;
  mode: 'create' | 'edit';
}

const RecipeManager: React.FC<RecipeManagerProps> = ({ productId, mode }) => {
  const { ingredients } = useIngredients();
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newRecipe, setNewRecipe] = useState<CreateRecipeInput>({
    productId: productId || '',
    ingredientId: '',
    quantity: 0,
    unit: 'g',
  });

  // Load recipes when productId changes
  useEffect(() => {
    if (productId && mode === 'edit') {
      loadRecipes();
    } else {
      setRecipes([]);
    }
  }, [productId, mode]);

  const loadRecipes = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const data = await recipeService.getByProduct(productId);
      setRecipes(data);
    } catch (error: any) {
      console.error('Error loading recipes:', error);
      toast.error('Không thể tải công thức');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecipe = async () => {
    if (!productId) {
      toast.error('Vui lòng lưu sản phẩm trước khi thêm công thức');
      return;
    }
    if (!newRecipe.ingredientId) {
      toast.error('Vui lòng chọn nguyên liệu');
      return;
    }
    if (newRecipe.quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    setIsAdding(true);
    try {
      const created = await recipeService.create({
        ...newRecipe,
        productId,
      });
      setRecipes([...recipes, created]);
      setNewRecipe({
        productId,
        ingredientId: '',
        quantity: 0,
        unit: ingredients.find((i) => i.id === newRecipe.ingredientId)?.unit || 'g',
      });
      toast.success('Thêm công thức thành công');
    } catch (error: any) {
      console.error('Error adding recipe:', error);
      toast.error(error?.response?.data?.error || 'Không thể thêm công thức');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Bạn có chắc muốn xóa công thức này?')) return;

    try {
      await recipeService.delete(recipeId);
      setRecipes(recipes.filter((r) => r.id !== recipeId));
      toast.success('Xóa công thức thành công');
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      toast.error('Không thể xóa công thức');
    }
  };

  const handleIngredientChange = (ingredientId: string) => {
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    setNewRecipe({
      ...newRecipe,
      ingredientId,
      unit: ingredient?.unit || 'g',
    });
  };

  if (mode === 'create' && !productId) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-700">
          💡 Lưu sản phẩm trước để thêm công thức (nguyên liệu)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800">📋 Công thức sản phẩm</h4>
        {mode === 'edit' && (
          <button
            onClick={loadRecipes}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={isLoading}
          >
            {isLoading ? 'Đang tải...' : '🔄 Làm mới'}
          </button>
        )}
      </div>

      {/* Add new recipe form */}
      {mode === 'edit' && productId && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Thêm nguyên liệu</h5>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Nguyên liệu</label>
              <select
                value={newRecipe.ingredientId}
                onChange={(e) => handleIngredientChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Chọn nguyên liệu</option>
                {ingredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name} ({ingredient.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Số lượng</label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={newRecipe.quantity || ''}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, quantity: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Đơn vị</label>
              <input
                type="text"
                value={newRecipe.unit}
                onChange={(e) => setNewRecipe({ ...newRecipe, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="g, ml, cái..."
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddRecipe}
                disabled={isAdding || !newRecipe.ingredientId || newRecipe.quantity <= 0}
                className="w-full px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAdding ? 'Đang thêm...' : '➕ Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipes list */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Đang tải công thức...</div>
      ) : recipes.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'create'
              ? 'Lưu sản phẩm để thêm công thức'
              : 'Chưa có công thức. Thêm nguyên liệu ở trên.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800">{recipe.ingredient.name}</span>
                  <span className="text-sm text-gray-500">
                    ({recipe.quantity} {recipe.unit})
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Đơn vị gốc: {recipe.ingredient.unit}
                </div>
              </div>
              {mode === 'edit' && (
                <button
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  🗑️ Xóa
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeManager;

