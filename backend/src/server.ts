import { createServer } from 'http';
import app from './app';
import env from './config/env';
import prisma from './config/database';
import { initializeSocketIO } from './socket/socket.io';
import logger from './utils/logger';
import { startDraftOrderCleanupJob } from './jobs/draftOrderCleanup.job';

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

    // PRODUCTION READY: Start background jobs
    startDraftOrderCleanupJob();

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

startServer();
