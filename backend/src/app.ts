import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import env from './config/env';
import logger from './utils/logger';
import { performHealthCheck } from './utils/healthCheck';
import { sanitizeInput } from './middleware/sanitize.middleware';
import { handleError } from './utils/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import stockRoutes from './routes/stock.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import recipeRoutes from './routes/recipe.routes';
import uploadRoutes from './routes/upload.routes';
import reportsRoutes from './routes/reports.routes';

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS - Normalize FRONTEND_URL (remove trailing slash)
const normalizedFrontendUrl = env.FRONTEND_URL.replace(/\/$/, '');
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Normalize origin (remove trailing slash)
      const normalizedOrigin = origin.replace(/\/$/, '');
      
      // Check if origin matches FRONTEND_URL (with or without trailing slash)
      if (normalizedOrigin === normalizedFrontendUrl || origin === env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Rate limiting (disable or relax in development to avoid 429 during local testing)
if (env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);
}

// Request logging middleware (before routes)
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input sanitization (XSS protection) - must be after body parsing
app.use(sanitizeInput);

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'OCHA POS API Documentation',
  customfavIcon: '/favicon.ico',
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check API and database connection status, memory usage, disk space, and response time
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
// Health check
app.get('/health', async (_req, res) => {
  const startTime = Date.now();
  try {
    const health = await performHealthCheck();
    const responseTime = Date.now() - startTime;
    
    // Add response time to health check
    const healthWithResponseTime = {
      ...health,
      responseTime,
      responseTimeFormatted: `${responseTime}ms`,
    };

    // Return appropriate status code based on health status
    if (health.status === 'error') {
      return res.status(503).json(healthWithResponseTime);
    } else if (health.status === 'warning') {
      return res.status(200).json(healthWithResponseTime);
    } else {
      return res.status(200).json(healthWithResponseTime);
    }
  } catch (error: any) {
    logger.error('Health check failed', { error: error.message, stack: error.stack });
    const responseTime = Date.now() - startTime;
    return res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: { status: 'disconnected' },
      error: error.message,
      responseTime,
      responseTimeFormatted: `${responseTime}ms`,
    });
  }
});

// API Info endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: 'OCHA POS Backend API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      stock: '/api/stock',
      dashboard: '/api/dashboard',
      recipes: '/api/recipes',
      upload: '/api/upload',
      health: '/health',
    },
    documentation: 'See API_ENDPOINTS.md for detailed API documentation',
    swagger: '/api-docs',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  handleError(err, res, req);
});

export default app;
