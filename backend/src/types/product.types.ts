/**
 * Re-export product and category types from shared-types package
 * This ensures type consistency between Frontend and Backend
 */
export type {
  CreateProductInput,
  UpdateProductInput,
  Product,
  ProductSize,
  ProductTopping,
  CreateCategoryInput,
  UpdateCategoryInput,
  Category,
} from '@ocha-pos/shared-types';

