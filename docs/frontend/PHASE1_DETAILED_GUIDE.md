# 📚 PHASE 1: SETUP & CORE - HƯỚNG DẪN CHI TIẾT

## 🎯 MỤC TIÊU PHASE 1
Setup nền tảng backend và implement các tính năng cốt lõi:
- ✅ Setup project structure
- ✅ Setup database (PostgreSQL + Prisma)
- ✅ Setup authentication (JWT)
- ✅ Implement Product CRUD APIs
- ✅ Implement Category APIs

**Thời gian ước tính: 1-2 tuần**

---

## 📋 BƯỚC 1: SETUP PROJECT STRUCTURE

### **1.1. Tạo thư mục backend**

```bash
# Tạo thư mục backend ở cùng cấp với frontend
cd ..
mkdir backend
cd backend
```

### **1.2. Khởi tạo Node.js project**

```bash
# Khởi tạo package.json
npm init -y

# Hoặc với TypeScript từ đầu
npx create-express-app backend --typescript
```

### **1.3. Cấu trúc thư mục**

Tạo cấu trúc thư mục như sau:

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Database connection
│   │   ├── env.ts           # Environment variables
│   │   └── constants.ts     # App constants
│   │
│   ├── controllers/         # Request handlers
│   │   ├── product.controller.ts
│   │   └── category.controller.ts
│   │
│   ├── services/            # Business logic
│   │   ├── product.service.ts
│   │   └── category.service.ts
│   │
│   ├── models/              # Prisma models (auto-generated)
│   │   └── index.ts         # Prisma client export
│   │
│   ├── routes/              # API routes
│   │   ├── index.ts         # Main router
│   │   ├── product.routes.ts
│   │   └── category.routes.ts
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── utils/               # Helper functions
│   │   ├── logger.ts
│   │   └── response.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── product.types.ts
│   │   └── common.types.ts
│   │
│   └── app.ts               # Express app setup
│   └── server.ts            # Server entry point
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # DB migrations (auto-generated)
│
├── tests/                   # Test files
│   ├── unit/
│   └── integration/
│
├── .env                     # Environment variables
├── .env.example             # Example env file
├── .gitignore
├── tsconfig.json            # TypeScript config
├── package.json
└── README.md
```

### **1.4. Tạo các file cơ bản**

```bash
# Tạo các thư mục
mkdir -p src/{config,controllers,services,routes,middleware,utils,types}
mkdir -p prisma tests/{unit,integration}

# Tạo các file cơ bản
touch src/app.ts src/server.ts
touch src/config/database.ts src/config/env.ts
touch .env .env.example
```

---

## 📦 BƯỚC 2: INSTALL DEPENDENCIES

### **2.1. Install core dependencies**

```bash
# Core framework
npm install express
npm install -D @types/express

# TypeScript
npm install -D typescript ts-node nodemon
npm install -D @types/node

# Database
npm install @prisma/client
npm install -D prisma

# Authentication
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs

# Validation
npm install zod

# Utilities
npm install dotenv cors helmet
npm install -D @types/cors

# Rate limiting
npm install express-rate-limit
```

### **2.2. package.json scripts**

Cập nhật `package.json`:

```json
{
  "name": "ocha-pos-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1",
    "nodemon": "^2.0.22",
    "prisma": "^5.0.0"
  }
}
```

---

## ⚙️ BƯỚC 3: CONFIGURATION FILES

### **3.1. tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### **3.2. .env.example**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ocha_pos?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### **3.3. .env** (tạo file này, không commit)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/ocha_pos?schema=public"
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### **3.4. src/config/env.ts**

```typescript
import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
}

function validateEnv(): EnvConfig {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  };
}

export const env = validateEnv();
```

### **3.5. src/config/database.ts**

```typescript
import { PrismaClient } from '@prisma/client';
import { env } from './env';

// PrismaClient singleton pattern
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

---

## 🗄️ BƯỚC 4: SETUP DATABASE (POSTGRESQL + PRISMA)

### **4.1. Install PostgreSQL**

**Windows:**
- Download từ: https://www.postgresql.org/download/windows/
- Hoặc dùng Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### **4.2. Tạo database**

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE ocha_pos;

# Tạo user (optional)
CREATE USER ocha_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ocha_pos TO ocha_user;

# Exit
\q
```

### **4.3. Setup Prisma**

```bash
# Initialize Prisma
npx prisma init
```

### **4.4. prisma/schema.prisma**

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== USER MODELS =====
enum UserRole {
  ADMIN
  STAFF
  CUSTOMER
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      UserRole @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// ===== CATEGORY MODELS =====
model Category {
  id          Int       @id @default(autoincrement())
  name        String
  image       String?
  description String?
  icon        String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("categories")
}

// ===== PRODUCT MODELS =====
model Size {
  id        Int      @id @default(autoincrement())
  name      String   // "S", "M", "L"
  extraPrice Float    @default(0)
  productId Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("sizes")
}

model Topping {
  id        Int      @id @default(autoincrement())
  name      String
  extraPrice Float    @default(0)
  productId Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("toppings")
}

model Product {
  id          Int       @id @default(autoincrement())
  name        String
  price       Float
  image       String
  categoryId  Int
  category    Category  @relation(fields: [categoryId], references: [id])
  description String?
  stock       Int       @default(0)
  isAvailable Boolean   @default(true)
  isPopular   Boolean   @default(false)
  rating      Float     @default(0)
  tags        String[]  @default([])
  sizes       Size[]
  toppings    Topping[]
  orderItems  OrderItem[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("products")
}

// ===== ORDER MODELS =====
enum OrderStatus {
  CREATING
  CONFIRMED
  PAID
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  CASH
  CARD
  QR
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}

model Order {
  id            Int           @id @default(autoincrement())
  orderNumber   String        @unique
  status        OrderStatus   @default(CREATING)
  totalPrice    Float
  customerName  String?
  customerTable String?
  paymentMethod PaymentMethod?
  paymentStatus PaymentStatus?
  items         OrderItem[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("orders")
}

model OrderItem {
  id              Int      @id @default(autoincrement())
  orderId         Int
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId       Int
  product         Product  @relation(fields: [productId], references: [id])
  quantity        Int
  basePrice       Float
  selectedSize    String?
  selectedToppings String[]
  note            String?
  totalPrice      Float
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("order_items")
}

// ===== STOCK MODELS =====
model Stock {
  id          Int       @id @default(autoincrement())
  name        String
  quantity    Float
  unit        String    // "kg", "lit", "piece"
  minQuantity Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("stocks")
}

model StockTransaction {
  id          Int       @id @default(autoincrement())
  stockId    Int
  type       String    // "in", "out"
  quantity   Float
  reason     String?
  createdAt   DateTime  @default(now())

  @@map("stock_transactions")
}
```

### **4.5. Generate Prisma Client & Run Migrations**

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migration
npm run prisma:migrate
# Nhập tên migration: init

# (Optional) Open Prisma Studio để xem database
npm run prisma:studio
```

---

## 🔐 BƯỚC 5: SETUP AUTHENTICATION (JWT)

### **5.1. src/types/common.types.ts**

```typescript
export interface JWTPayload {
  userId: number;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
```

### **5.2. src/utils/jwt.ts**

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { JWTPayload } from '../types/common.types';

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
```

### **5.3. src/utils/bcrypt.ts**

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

### **5.4. src/middleware/auth.middleware.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import type { AuthRequest, JWTPayload } from '../types/common.types';

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}
```

---

## 🛣️ BƯỚC 6: SETUP EXPRESS APP

### **6.1. src/utils/response.ts**

```typescript
import { Response } from 'express';

export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
```

### **6.2. src/middleware/error.middleware.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Duplicate entry',
        error: err.meta,
      });
      return;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}
```

### **6.3. src/app.ts**

```typescript
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { router } from './routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

### **6.4. src/server.ts**

```typescript
import app from './app';
import { env } from './config/env';

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
});
```

---

## 📝 BƯỚC 7: IMPLEMENT PRODUCT APIs

### **7.1. src/types/product.types.ts**

```typescript
import { z } from 'zod';

// Validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
  image: z.string().url('Invalid image URL'),
  categoryId: z.number().int().positive(),
  description: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  rating: z.number().min(0).max(5).default(0),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.object({
    name: z.string(),
    extraPrice: z.number().default(0),
  })).optional(),
  toppings: z.array(z.object({
    name: z.string(),
    extraPrice: z.number().default(0),
  })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
```

### **7.2. src/services/product.service.ts**

```typescript
import { prisma } from '../config/database';
import type { CreateProductInput, UpdateProductInput } from '../types/product.types';

export class ProductService {
  async getAll() {
    return prisma.product.findMany({
      include: {
        category: true,
        sizes: true,
        toppings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getById(id: number) {
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

    return prisma.product.create({
      data: {
        ...productData,
        sizes: sizes ? {
          create: sizes,
        } : undefined,
        toppings: toppings ? {
          create: toppings,
        } : undefined,
      },
      include: {
        category: true,
        sizes: true,
        toppings: true,
      },
    });
  }

  async update(id: number, data: UpdateProductInput) {
    const { sizes, toppings, ...productData } = data;

    // Check if product exists
    await this.getById(id);

    // Update sizes and toppings separately if provided
    if (sizes) {
      // Delete existing sizes
      await prisma.size.deleteMany({ where: { productId: id } });
      // Create new sizes
      await prisma.size.createMany({
        data: sizes.map(s => ({ ...s, productId: id })),
      });
    }

    if (toppings) {
      // Delete existing toppings
      await prisma.topping.deleteMany({ where: { productId: id } });
      // Create new toppings
      await prisma.topping.createMany({
        data: toppings.map(t => ({ ...t, productId: id })),
      });
    }

    return prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
        sizes: true,
        toppings: true,
      },
    });
  }

  async delete(id: number) {
    await this.getById(id);
    return prisma.product.delete({
      where: { id },
    });
  }
}

export const productService = new ProductService();
```

### **7.3. src/controllers/product.controller.ts**

```typescript
import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { successResponse, errorResponse } from '../utils/response';

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAll();
      return successResponse(res, products, 'Products retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await productService.getById(id);
      return successResponse(res, product, 'Product retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const product = await productService.create(req.body);
      return successResponse(res, product, 'Product created successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await productService.update(id, req.body);
      return successResponse(res, product, 'Product updated successfully');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      await productService.delete(id);
      return successResponse(res, null, 'Product deleted successfully');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }
}

export const productController = new ProductController();
```

### **7.4. src/middleware/validation.middleware.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const errors = error.errors?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return errorResponse(res, 'Validation failed', 400, errors);
    }
  };
}
```

### **7.5. src/routes/product.routes.ts**

```typescript
import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createProductSchema, updateProductSchema } from '../types/product.types';

const router = Router();

// Public routes
router.get('/', productController.getAll.bind(productController));
router.get('/:id', productController.getById.bind(productController));

// Protected routes (require authentication)
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(createProductSchema),
  productController.create.bind(productController)
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(updateProductSchema),
  productController.update.bind(productController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  productController.delete.bind(productController)
);

export default router;
```

---

## 📁 BƯỚC 8: IMPLEMENT CATEGORY APIs

### **8.1. src/types/category.types.ts**

```typescript
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.string().url('Invalid image URL').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
```

### **8.2. src/services/category.service.ts**

```typescript
import { prisma } from '../config/database';
import type { CreateCategoryInput, UpdateCategoryInput } from '../types/category.types';

export class CategoryService {
  async getAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async create(data: CreateCategoryInput) {
    return prisma.category.create({
      data,
    });
  }

  async update(id: number, data: UpdateCategoryInput) {
    await this.getById(id);
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    await this.getById(id);
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryService = new CategoryService();
```

### **8.3. src/controllers/category.controller.ts**

```typescript
import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { successResponse, errorResponse } from '../utils/response';

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAll();
      return successResponse(res, categories, 'Categories retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await categoryService.getById(id);
      return successResponse(res, category, 'Category retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const category = await categoryService.create(req.body);
      return successResponse(res, category, 'Category created successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await categoryService.update(id, req.body);
      return successResponse(res, category, 'Category updated successfully');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      await categoryService.delete(id);
      return successResponse(res, null, 'Category deleted successfully');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }
}

export const categoryController = new CategoryController();
```

### **8.4. src/routes/category.routes.ts**

```typescript
import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createCategorySchema, updateCategorySchema } from '../types/category.types';

const router = Router();

// Public routes
router.get('/', categoryController.getAll.bind(categoryController));
router.get('/:id', categoryController.getById.bind(categoryController));

// Protected routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(createCategorySchema),
  categoryController.create.bind(categoryController)
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  validate(updateCategorySchema),
  categoryController.update.bind(categoryController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  categoryController.delete.bind(categoryController)
);

export default router;
```

---

## 🔗 BƯỚC 9: SETUP ROUTES

### **9.1. src/routes/index.ts**

```typescript
import { Router } from 'express';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';

const router = Router();

// API routes
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

export { router };
```

---

## ✅ BƯỚC 10: TEST APIs

### **10.1. Test với Postman/Thunder Client**

**Start server:**
```bash
npm run dev
```

**Test endpoints:**

1. **GET /api/products**
   ```
   GET http://localhost:5000/api/products
   ```

2. **GET /api/products/:id**
   ```
   GET http://localhost:5000/api/products/1
   ```

3. **POST /api/products** (cần auth token)
   ```json
   POST http://localhost:5000/api/products
   Headers: Authorization: Bearer <token>
   Body:
   {
     "name": "Cà phê đen",
     "price": 25000,
     "image": "https://example.com/image.jpg",
     "categoryId": 1,
     "description": "Cà phê đen đậm đà",
     "stock": 100,
     "isAvailable": true,
     "isPopular": true,
     "sizes": [
       { "name": "S", "extraPrice": 0 },
       { "name": "M", "extraPrice": 5000 },
       { "name": "L", "extraPrice": 10000 }
     ]
   }
   ```

4. **GET /api/categories**
   ```
   GET http://localhost:5000/api/categories
   ```

### **10.2. Test với curl**

```bash
# Get all products
curl http://localhost:5000/api/products

# Get product by ID
curl http://localhost:5000/api/products/1

# Get all categories
curl http://localhost:5000/api/categories
```

---

## 📋 CHECKLIST HOÀN THÀNH PHASE 1

- [ ] ✅ Project structure đã setup
- [ ] ✅ Dependencies đã install
- [ ] ✅ Configuration files đã tạo
- [ ] ✅ Database (PostgreSQL) đã setup
- [ ] ✅ Prisma schema đã tạo và migrate
- [ ] ✅ Authentication (JWT) đã setup
- [ ] ✅ Express app đã setup
- [ ] ✅ Product CRUD APIs đã implement
- [ ] ✅ Category APIs đã implement
- [ ] ✅ APIs đã test thành công

---

## 🚀 NEXT STEPS (Phase 2)

Sau khi hoàn thành Phase 1, bạn sẽ:
1. Implement Order APIs
2. Implement Payment processing
3. Setup Socket.io cho real-time
4. Implement order status updates

---

## 💡 TIPS & TROUBLESHOOTING

### **Lỗi thường gặp:**

1. **Database connection error**
   - Kiểm tra PostgreSQL đang chạy
   - Kiểm tra DATABASE_URL trong .env
   - Test connection: `psql -U postgres -d ocha_pos`

2. **Prisma generate error**
   - Chạy: `npx prisma generate`
   - Kiểm tra schema.prisma syntax

3. **Port already in use**
   - Đổi PORT trong .env
   - Hoặc kill process: `lsof -ti:5000 | xargs kill`

4. **TypeScript errors**
   - Chạy: `npm run build` để check errors
   - Kiểm tra tsconfig.json

### **Best Practices:**

- ✅ Luôn validate input với Zod
- ✅ Sử dụng try-catch trong controllers
- ✅ Log errors để debug
- ✅ Sử dụng Prisma transactions cho operations phức tạp
- ✅ Tách business logic vào services
- ✅ Sử dụng TypeScript types đầy đủ

---

**Chúc bạn code vui vẻ! 🎉**

