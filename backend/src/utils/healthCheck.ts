import fs from 'fs';
import path from 'path';
import os from 'os';
import prisma from '../config/database';
import logger from './logger';

/**
 * Check database connection
 */
export async function checkDatabase(): Promise<{ status: string; responseTime?: number }> {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    return { status: 'connected', responseTime };
  } catch (error: any) {
    logger.error('Database health check failed', { error: error.message });
    return { status: 'disconnected' };
  }
}

/**
 * Check disk space
 */
export function checkDiskSpace(): { available: number; total: number; used: number; percentage: number; status: string } {
  try {
    // Check disk space for the root directory (or current working directory)
    // For Windows, we can't easily get disk space without additional packages
    // For now, return a basic check
    if (process.platform === 'win32') {
      // On Windows, we'll check if we can write to the uploads directory
      const uploadsDir = path.join(__dirname, '../../uploads');
      try {
        fs.accessSync(uploadsDir, fs.constants.W_OK);
        return {
          available: 0, // Unknown on Windows without additional packages
          total: 0,
          used: 0,
          percentage: 0,
          status: 'ok', // Assume OK if we can write
        };
      } catch {
        return {
          available: 0,
          total: 0,
          used: 0,
          percentage: 100,
          status: 'error',
        };
      }
    } else {
      // On Unix-like systems, use statfs if available
      // For now, return basic check
      try {
        const testFile = path.join(__dirname, '../../.health-check');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return {
          available: 0, // Would need additional package for actual disk space
          total: 0,
          used: 0,
          percentage: 0,
          status: 'ok',
        };
      } catch {
        return {
          available: 0,
          total: 0,
          used: 0,
          percentage: 100,
          status: 'error',
        };
      }
    }
  } catch (error: any) {
    logger.error('Disk space check failed', { error: error.message });
    return {
      available: 0,
      total: 0,
      used: 0,
      percentage: 0,
      status: 'unknown',
    };
  }
}

/**
 * Get memory usage in a readable format
 */
export function getMemoryUsage(): {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  rssMB: number;
  heapTotalMB: number;
  heapUsedMB: number;
  percentage: number;
} {
  const usage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const percentage = (usage.rss / totalMemory) * 100;

  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers || 0,
    rssMB: Math.round((usage.rss / 1024 / 1024) * 100) / 100,
    heapTotalMB: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100,
    heapUsedMB: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
  };
}

/**
 * Comprehensive health check
 */
export async function performHealthCheck(): Promise<{
  status: string;
  timestamp: string;
  uptime: number;
  uptimeFormatted: string;
  database: { status: string; responseTime?: number };
  memory: ReturnType<typeof getMemoryUsage>;
  disk: ReturnType<typeof checkDiskSpace>;
  environment: string;
}> {
  const database = await checkDatabase();
  const memory = getMemoryUsage();
  const disk = checkDiskSpace();
  
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

  // Determine overall status
  let overallStatus = 'ok';
  if (database.status !== 'connected') {
    overallStatus = 'error';
  } else if (memory.percentage > 90) {
    overallStatus = 'warning';
  } else if (disk.status === 'error') {
    overallStatus = 'warning';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime,
    uptimeFormatted,
    database,
    memory,
    disk,
    environment: process.env.NODE_ENV || 'development',
  };
}

