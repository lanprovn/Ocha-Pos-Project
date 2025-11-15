import { createServer } from 'http';
import app from './app';
import env from './config/env';
import prisma from './config/database';
import { initializeSocketIO } from './socket/socket.io';
import logger from './utils/logger';
import { startDraftOrderCleanupJob } from './jobs/draftOrderCleanup.job';

// Log immediately to console (before logger might be used)
console.log('🚀 Starting server...');

// Railway automatically sets PORT environment variable
const PORT = parseInt(process.env.PORT || env.PORT, 10);

console.log(`📋 Environment: ${env.NODE_ENV}`);
console.log(`🔌 Port: ${PORT}`);

async function startServer() {
  try {
    console.log('🔗 Connecting to database...');
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');
    console.log('✅ Database connected successfully');

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io
    initializeSocketIO(httpServer);

    // PRODUCTION READY: Start background jobs
    startDraftOrderCleanupJob();

    // Start server
    console.log(`🌐 Starting HTTP server on port ${PORT}...`);
    httpServer.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`, {
        port: PORT,
        environment: env.NODE_ENV,
        apiBaseUrl: `http://localhost:${PORT}/api`,
      });
      console.log(`✅ Server is running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:');
    console.error(error.message);
    console.error(error.stack);
    if (logger) {
      logger.error('Failed to start server', { error: error.message, stack: error.stack });
    }
    process.exit(1);
  }
}

// Wrap in try-catch to catch any import errors
try {
  startServer();
} catch (error: any) {
  console.error('❌ Fatal error during server initialization:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
