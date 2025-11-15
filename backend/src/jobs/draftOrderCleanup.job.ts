/**
 * Draft Order Cleanup Job - PRODUCTION READY
 * Cleans up old draft orders (CREATING status) older than 1 hour
 * Runs every 5 minutes
 */

import prisma from '../config/database';
import logger from '../utils/logger';

let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Cleanup old draft orders
 */
async function cleanupOldDraftOrders(): Promise<void> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const result = await prisma.order.deleteMany({
      where: {
        status: 'CREATING',
        createdAt: {
          lt: oneHourAgo,
        },
      },
    });

    if (result.count > 0) {
      logger.info(`Cleaned up ${result.count} old draft orders`, {
        count: result.count,
        olderThan: oneHourAgo.toISOString(),
      });
    }
  } catch (error: any) {
    logger.error('Error cleaning up draft orders', {
      error: error.message,
      stack: error.stack,
    });
  }
}

/**
 * Start the cleanup job
 * Runs every 5 minutes
 */
export function startDraftOrderCleanupJob(): void {
  // Run immediately on start
  cleanupOldDraftOrders();

  // Then run every 5 minutes
  cleanupInterval = setInterval(() => {
    cleanupOldDraftOrders();
  }, 5 * 60 * 1000); // 5 minutes

  logger.info('Draft order cleanup job started (runs every 5 minutes)');
}

/**
 * Stop the cleanup job
 */
export function stopDraftOrderCleanupJob(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Draft order cleanup job stopped');
  }
}

