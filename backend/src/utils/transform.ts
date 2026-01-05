import { Decimal } from '@prisma/client/runtime/library';

/**
 * Transform Prisma Decimal to number
 */
export function decimalToNumber(value: Decimal | null | undefined): number {
  if (!value) return 0;
  return parseFloat(value.toString());
}

/**
 * Transform Product response to match frontend format
 */
export function transformProduct(product: any) {
  return {
    id: product.id, // Keep as string (UUID), frontend can handle
    name: product.name,
    price: decimalToNumber(product.price),
    image: product.image || '',
    category: product.category?.name || '',
    restaurant: '', // Frontend expects string, but we don't have restaurant in schema yet
    rating: decimalToNumber(product.rating),
    description: product.description || '',
    discount: decimalToNumber(product.discount),
    stock: product.stock || 0,
    isAvailable: product.isAvailable ?? true,
    isPopular: product.isPopular ?? false,
    tags: product.tags || [],
    sizes: (product.sizes || []).map((size: any) => ({
      id: size.id,
      name: size.name,
      extraPrice: decimalToNumber(size.extraPrice),
    })),
    toppings: (product.toppings || []).map((topping: any) => ({
      id: topping.id,
      name: topping.name,
      extraPrice: decimalToNumber(topping.extraPrice),
    })),
  };
}

/**
 * Transform Category response to match frontend format
 */
export function transformCategory(category: any) {
  return {
    id: category.id, // Keep as string (UUID)
    name: category.name,
    image: category.image || '',
    description: category.description || '',
    productCount: category.productCount || 0,
    icon: category.icon || 'fas fa-th-large',
  };
}

