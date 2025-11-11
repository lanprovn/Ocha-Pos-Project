export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  image?: string;
  rating?: number;
  discount?: number;
  stock?: number;
  isAvailable?: boolean;
  isPopular?: boolean;
  tags?: string[];
  sizes?: Array<{ name: string; extraPrice: number }>;
  toppings?: Array<{ name: string; extraPrice: number }>;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  image?: string;
  rating?: number;
  discount?: number;
  stock?: number;
  isAvailable?: boolean;
  isPopular?: boolean;
  tags?: string[];
}

export interface CreateCategoryInput {
  name: string;
  image?: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  image?: string;
  description?: string;
  icon?: string;
}

