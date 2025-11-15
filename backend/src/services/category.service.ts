import { CreateCategoryInput, UpdateCategoryInput } from '../types/product.types';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { categoryRepository } from '../repositories';

export class CategoryService {
  constructor(private repository = categoryRepository) {}

  async getAll() {
    const categories = await this.repository.findAllWithCount();

    return categories.map((category) => ({
      ...category,
      productCount: category._count.products,
    }));
  }

  async getById(id: string) {
    const category = await this.repository.findByIdWithProducts(id);

    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      ...category,
      productCount: category._count.products,
    };
  }

  async create(data: CreateCategoryInput) {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateCategoryInput) {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await this.repository.delete(id);

    return { message: 'Category deleted successfully' };
  }
}

export default new CategoryService();

