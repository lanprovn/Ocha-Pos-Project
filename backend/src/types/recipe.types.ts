export interface CreateRecipeInput {
  productId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
}

export interface UpdateRecipeInput {
  quantity?: number;
  unit?: string;
}

export interface RecipeItem {
  id: string;
  productId: string;
  ingredientId: string;
  quantity: string;
  unit: string;
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
  product: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

