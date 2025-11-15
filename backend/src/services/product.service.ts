import prisma from '../config/database';
import { CreateProductInput, UpdateProductInput } from '../types/product.types';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductService {
  /**
   * Get all products with optional pagination
   * OPTIMIZED: Added pagination to prevent loading too many products at once
   */
  async getAll(page?: number, limit?: number) {
    // If pagination params provided, return paginated result
    if (page !== undefined && limit !== undefined) {
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
    return prisma.product.findMany({
      include: {
        category: true,
        sizes: true,
        toppings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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

    return { message: 'Product deleted successfully' };
  }
}

export default new ProductService();

