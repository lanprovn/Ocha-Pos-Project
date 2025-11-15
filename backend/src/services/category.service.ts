import prisma from '../config/database';
import { CreateCategoryInput, UpdateCategoryInput } from '../types/product.types';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export class CategoryService {
  async getAll() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((category) => ({
      ...category,
      productCount: category._count.products,
    }));
  }

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        products: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      ...category,
      productCount: category._count.products,
    };
  }

  async create(data: CreateCategoryInput) {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}

export default new CategoryService();

