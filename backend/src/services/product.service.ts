import prisma from '../config/database';
import { CreateProductInput, UpdateProductInput } from '../types/product.types';
import { Decimal } from '@prisma/client/runtime/library';

// Simple in-memory cache for products (TTL: 5 minutes)
const productCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class ProductService {
  /**
   * Get all products with optional pagination
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @param includeAll - If true, ignore pagination and return all (for backward compatibility)
   */
  async getAll(page?: number, limit?: number, includeAll: boolean = false) {
    const cacheKey = `products_${page}_${limit}_${includeAll}`;
    const cached = productCache.get(cacheKey);

    // Check cache
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const queryOptions: any = {
      include: {
        category: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        sizes: {
          select: {
            id: true,
            name: true,
            extraPrice: true,
          },
        },
        toppings: {
          select: {
            id: true,
            name: true,
            extraPrice: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    // Add pagination if not including all
    if (!includeAll && page && limit) {
      const skip = (page - 1) * limit;
      queryOptions.skip = skip;
      queryOptions.take = limit;
    }

    const products = await prisma.product.findMany(queryOptions);

    // Cache result
    productCache.set(cacheKey, {
      data: products,
      expires: Date.now() + CACHE_TTL,
    });

    // Clean expired cache entries periodically
    if (productCache.size > 100) {
      for (const [key, value] of productCache.entries()) {
        if (value.expires <= Date.now()) {
          productCache.delete(key);
        }
      }
    }

    return products;
  }

  /**
   * Get total count of products (for pagination)
   */
  async getCount() {
    return prisma.product.count();
  }

  /**
   * Clear product cache (call after create/update/delete)
   */
  clearCache() {
    productCache.clear();
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        sizes: true,
        toppings: true,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async create(data: CreateProductInput) {
    const { sizes, toppings, ...productData } = data;

    const product = await prisma.product.create({
      data: {
        ...productData,
        price: new Decimal(productData.price),
        rating: productData.rating ? new Decimal(productData.rating) : null,
        discount: productData.discount ? new Decimal(productData.discount) : null,
        sizes: sizes
          ? {
            create: sizes.map((s) => ({
              name: s.name,
              extraPrice: new Decimal(s.extraPrice),
            })),
          }
          : undefined,
        toppings: toppings
          ? {
            create: toppings.map((t) => ({
              name: t.name,
              extraPrice: new Decimal(t.extraPrice),
            })),
          }
          : undefined,
      },
      include: {
        category: true,
        sizes: true,
        toppings: true,
      },
    });

    // Clear cache after create
    this.clearCache();

    return product;
  }

  async update(id: string, data: UpdateProductInput) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const updateData: any = { ...data };

    if (data.price !== undefined) {
      updateData.price = new Decimal(data.price);
    }
    if (data.rating !== undefined) {
      updateData.rating = data.rating ? new Decimal(data.rating) : null;
    }
    if (data.discount !== undefined) {
      updateData.discount = data.discount ? new Decimal(data.discount) : null;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        sizes: true,
        toppings: true,
      },
    });

    // Clear cache after update
    this.clearCache();

    return updated;
  }

  async delete(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    await prisma.product.delete({
      where: { id },
    });

    // Clear cache after delete
    this.clearCache();

    return { message: 'Product deleted successfully' };
  }
}

export default new ProductService();

