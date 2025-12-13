import prisma from '../config/database';
import { CreateProductInput, UpdateProductInput } from '../types/product.types';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductService {
  async getAll() {
    return prisma.product.findMany({
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

