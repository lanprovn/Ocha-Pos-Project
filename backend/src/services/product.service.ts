import prisma from '@config/database';
import { CreateProductInput, UpdateProductInput } from '@core/types/product.types';
import { Decimal } from '@prisma/client/runtime/library';

// Simple in-memory cache for products (TTL: 5 minutes)
const productCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface PaginationParams {
  page?: string | number | undefined;
  limit?: string | number | undefined;
  includeAll?: string | boolean | undefined;
}

export interface PaginationResult<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ProductService {
  /**
   * Get all products with optional pagination
   * Handles all business logic: parsing params, calculating pagination, fetching data and count
   * @param params - Raw query parameters from request
   * @returns Paginated result with data and pagination metadata, or simple array if includeAll
   */
  async getAllWithPagination(params: PaginationParams): Promise<PaginationResult<any> | any[]> {
    // Parse pagination params (optional - backward compatible)
    const page = params.page ? parseInt(params.page as string, 10) : undefined;
    const limit = params.limit ? parseInt(params.limit as string, 10) : undefined;
    const includeAll = params.includeAll === 'true' || params.includeAll === true || (!page && !limit);

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

    // If pagination is used, fetch data and count, then return structured result
    if (!includeAll && page && limit) {
      const skip = (page - 1) * limit;
      queryOptions.skip = skip;
      queryOptions.take = limit;

      // Fetch data and count in parallel
      const [products, total] = await Promise.all([
        prisma.product.findMany(queryOptions),
        prisma.product.count(),
      ]);

      const totalPages = Math.ceil(total / limit);

      const result: PaginationResult<any> = {
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };

      // Cache result
      productCache.set(cacheKey, {
        data: result,
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

      return result;
    } else {
      // Return all products (no pagination)
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
  }

  /**
   * Get all products with optional pagination (legacy method for backward compatibility)
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @param includeAll - If true, ignore pagination and return all (for backward compatibility)
   * @deprecated Use getAllWithPagination instead
   */
  async getAll(page?: number, limit?: number, includeAll: boolean = false) {
    return this.getAllWithPagination({ page, limit, includeAll });
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

