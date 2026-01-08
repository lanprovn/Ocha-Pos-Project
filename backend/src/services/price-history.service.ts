import prisma from '@config/database';
import logger from '@utils/logger';

export class PriceHistoryService {
  /**
   * Get price history for a product
   */
  async getByProductId(productId: string) {
    try {
      const history = await (prisma as any).priceHistory.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to last 100 changes
      });

      return history || [];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching price history', {
        error: errorMessage,
        productId,
      });
      
      // If model doesn't exist (migration not run), return empty array
      if (errorMessage.includes('priceHistory') || errorMessage.includes('Unknown model')) {
        logger.warn('PriceHistory model not found. Please run: npx prisma migrate dev && npx prisma generate');
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Get all price history with pagination
   */
  async getAll(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const [history, total] = await Promise.all([
        (prisma as any).priceHistory.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        }),
        (prisma as any).priceHistory.count(),
      ]);

      return {
        data: history || [],
        pagination: {
          page,
          limit,
          total: total || 0,
          totalPages: Math.ceil((total || 0) / limit),
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching price history list', {
        error: errorMessage,
      });
      
      // If model doesn't exist (migration not run), return empty result
      if (errorMessage.includes('priceHistory') || errorMessage.includes('Unknown model')) {
        logger.warn('PriceHistory model not found. Please run: npx prisma migrate dev && npx prisma generate');
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
      
      throw error;
    }
  }
}

export default new PriceHistoryService();

