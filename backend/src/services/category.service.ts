import prisma from '@config/database';
import { CreateCategoryInput, UpdateCategoryInput } from '@core/types/product.types';

// Simple in-memory cache for categories (TTL: 10 minutes - categories change less frequently)
const categoryCache = new Map<string, { data: any; expires: number }>();
const CATEGORY_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export class CategoryService {
  async getAll() {
    const cacheKey = 'categories_all';
    const cached = categoryCache.get(cacheKey);

    // Check cache
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

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

    const result = categories.map((category) => ({
      ...category,
      productCount: category._count.products,
    }));

    // Cache result
    categoryCache.set(cacheKey, {
      data: result,
      expires: Date.now() + CATEGORY_CACHE_TTL,
    });

    return result;
  }

  /**
   * Clear category cache (call after create/update/delete)
   */
  clearCache() {
    categoryCache.clear();
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
      throw new Error('Category not found');
    }

    return {
      ...category,
      productCount: category._count.products,
    };
  }

  async create(data: CreateCategoryInput) {
    const category = await prisma.category.create({
      data,
    });

    // Clear cache after create
    this.clearCache();

    return category;
  }

  async update(id: string, data: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    // Clear cache after update
    this.clearCache();

    return updated;
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    await prisma.category.delete({
      where: { id },
    });

    // Clear cache after delete
    this.clearCache();

    return { message: 'Category deleted successfully' };
  }
}

export default new CategoryService();

