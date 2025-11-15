import prisma from '../config/database';
import { BaseRepository } from './base.repository';
import { CreateProductInput, UpdateProductInput } from '../types/product.types';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductRepository extends BaseRepository<any> {
  protected model = prisma.product;

  /**
   * Get all products with relations
   */
  async findAll(includeRelations = true) {
    return prisma.product.findMany({
      include: includeRelations
        ? {
            category: true,
            sizes: true,
            toppings: true,
          }
        : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get products with pagination
   */
  async findManyPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      prisma.product.count(),
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          category: true,
          sizes: true,
          toppings: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return { products, total };
  }

  /**
   * Find product by ID with relations
   */
  async findByIdWithRelations(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        sizes: true,
        toppings: true,
      },
    });
  }

  /**
   * Find products by IDs
   */
  async findByIds(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
  }

  /**
   * Create product with sizes and toppings
   */
  async create(data: CreateProductInput) {
    const { sizes, toppings, ...productData } = data;

    return prisma.product.create({
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
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductInput) {
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

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        sizes: true,
        toppings: true,
      },
    });
  }
}

export default new ProductRepository();

