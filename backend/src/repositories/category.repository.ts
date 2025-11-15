import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class CategoryRepository extends BaseRepository<any> {
  protected model = prisma.category;

  /**
   * Get all categories with product count
   */
  async findAllWithCount() {
    return prisma.category.findMany({
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
  }

  /**
   * Find category by ID with products
   */
  async findByIdWithProducts(id: string) {
    return prisma.category.findUnique({
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
  }
}

export default new CategoryRepository();

