import { createServer } from 'http';
import app from './app';
import env from './config/env';
import prisma from './config/database';
import { initializeSocketIO } from './socket/socket.io';
import logger from './utils/logger';

const PORT = parseInt(env.PORT, 10);

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io
    initializeSocketIO(httpServer);

    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`, {
        port: PORT,
        environment: env.NODE_ENV,
        apiBaseUrl: `http://localhost:${PORT}/api`,
      });
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at Promise', { reason, promise });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

startServer();
