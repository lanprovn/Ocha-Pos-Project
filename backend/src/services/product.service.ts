import { CreateProductInput, UpdateProductInput } from '../types/product.types';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { productRepository } from '../repositories';

export class ProductService {
  constructor(private repository = productRepository) {}

  /**
   * Get all products with optional pagination
   * OPTIMIZED: Added pagination to prevent loading too many products at once
   */
  async getAll(page?: number, limit?: number) {
    // If pagination params provided, return paginated result
    if (page !== undefined && limit !== undefined) {
      const { products, total } = await this.repository.findManyPaginated(page, limit);

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // Backward compatibility: return all products if no pagination params
    return this.repository.findAll(true);
  }

  async getById(id: string) {
    const product = await this.repository.findByIdWithRelations(id);

    if (!product) {
      throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return product;
  }

  async create(data: CreateProductInput) {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateProductInput) {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await this.repository.delete(id);

    return { message: 'Product deleted successfully' };
  }
}

export default new ProductService();

