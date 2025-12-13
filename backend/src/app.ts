import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import env from './config/env';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler.middleware';

// Routes
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import stockRoutes from './routes/stock.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import recipeRoutes from './routes/recipe.routes';
import uploadRoutes from './routes/upload.routes';
import reportingRoutes from './routes/reporting.routes';

const app: Express = express();

// Trust proxy (required for reverse proxies)
// Use 1 instead of true to only trust first proxy hop
// This prevents rate limiting bypass while still working with proxies
app.set('trust proxy', 1);

// Security middleware - configure Helmet to allow images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to be loaded from different origins
    crossOriginEmbedderPolicy: false, // Allow embedding images
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// CORS - Support multiple frontend URLs (comma-separated)
const allowedOrigins = env.FRONTEND_URL.split(',').map(url => url.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // In production, also allow Railway frontend domains as fallback
      if (env.NODE_ENV === 'production' && origin && origin.includes('railway.app')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting (disable or relax in development to avoid 429 during local testing)
if (env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs (increased for frontend initial load)
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
    // Skip rate limiting for health check endpoint
    skip: (req) => req.path === '/health' || req.path === '/api/health',
    // Trust proxy: 1 is safe and prevents bypass
    // req.ip will correctly get the client IP from X-Forwarded-For header
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

// Serve static files (uploaded images) - must be after CORS but before routes
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    // Allow cross-origin requests for images
    res.setHeader('Access-Control-Allow-Origin', env.FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

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
 *     description: Check API and database connection status
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
  try {
    // Check database connection
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
    });
  } catch (error: any) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
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
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reporting', reportingRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    errorCode: 'NOT_FOUND',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

export default app;
