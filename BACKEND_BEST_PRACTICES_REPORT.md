# 📊 Báo Cáo Best Practices Backend & API Design 2024-2025

## 🎯 Tổng Quan

Báo cáo này tổng hợp các best practices hiện đại nhất cho việc viết backend, thiết kế API, và tổ chức code structure dựa trên nghiên cứu các xu hướng và tiêu chuẩn quốc tế hiện tại.

---

## 📁 1. CẤU TRÚC FOLDER & CODE ORGANIZATION

### 1.1. Kiến Trúc Phổ Biến Hiện Tại

#### **Layered Architecture (Kiến trúc phân lớp)**
```
backend/
├── src/
│   ├── config/          # Configuration (env, database, swagger)
│   ├── constants/       # Constants (status codes, messages)
│   ├── controllers/     # Request handlers (thin layer)
│   ├── services/        # Business logic (thick layer)
│   ├── repositories/    # Data access layer (optional)
│   ├── models/          # Data models/types
│   ├── middleware/      # Express middleware
│   ├── routes/          # Route definitions
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types/interfaces
│   ├── validators/      # Validation schemas
│   ├── errors/          # Custom error classes
│   └── app.ts           # Express app setup
└── server.ts            # Server entry point
```

#### **Clean Architecture / Hexagonal Architecture**
- **Domain Layer**: Core business logic (entities, use cases)
- **Application Layer**: Application-specific logic (services)
- **Infrastructure Layer**: External concerns (database, HTTP, file system)
- **Presentation Layer**: Controllers, routes

### 1.2. Best Practices cho Folder Structure

✅ **DO:**
- Tách biệt rõ ràng giữa layers (controllers → services → repositories)
- Nhóm các file liên quan lại với nhau
- Sử dụng feature-based structure cho dự án lớn:
  ```
  src/
  ├── features/
  │   ├── users/
  │   │   ├── user.controller.ts
  │   │   ├── user.service.ts
  │   │   ├── user.repository.ts
  │   │   ├── user.types.ts
  │   │   └── user.routes.ts
  │   └── products/
  │       └── ...
  └── shared/
      ├── middleware/
      ├── utils/
      └── types/
  ```

❌ **DON'T:**
- Đặt tất cả logic vào controllers
- Trộn lẫn business logic với routing logic
- Tạo quá nhiều nested folders

---

## 🔌 2. API DESIGN BEST PRACTICES

### 2.1. RESTful API Standards

#### **URL Naming Conventions**
```
✅ GOOD:
GET    /api/users              # List users
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user (full)
PATCH  /api/users/:id          # Update user (partial)
DELETE /api/users/:id          # Delete user

❌ BAD:
GET    /api/getUsers
POST   /api/createUser
GET    /api/user/:id/delete
```

#### **HTTP Methods Usage**
- **GET**: Read data (idempotent, safe)
- **POST**: Create new resource
- **PUT**: Replace entire resource (idempotent)
- **PATCH**: Partial update (idempotent)
- **DELETE**: Remove resource (idempotent)

#### **HTTP Status Codes**
```typescript
// Success
200 OK                    // Successful GET, PUT, PATCH
201 Created               // Successful POST
204 No Content            // Successful DELETE

// Client Errors
400 Bad Request           // Invalid input
401 Unauthorized          // Not authenticated
403 Forbidden            // Not authorized
404 Not Found            // Resource not found
409 Conflict             // Resource conflict (e.g., duplicate)
422 Unprocessable Entity // Validation errors

// Server Errors
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

### 2.2. API Response Format Standardization

#### **Standard Response Structure**
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "statusCode": 200
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "details": { ... } // Optional, for development
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "statusCode": 200
}
```

#### **Best Practices:**
- ✅ Luôn có field `success` để dễ check
- ✅ Consistent structure cho tất cả endpoints
- ✅ Include `statusCode` trong response body
- ✅ Separate `message` (user-friendly) và `error` (technical)
- ✅ Pagination metadata cho list endpoints

### 2.3. API Versioning

```typescript
// URL Versioning (Recommended)
/api/v1/users
/api/v2/users

// Header Versioning
Accept: application/vnd.api+json;version=1

// Query Parameter (Not recommended)
/api/users?version=1
```

### 2.4. Query Parameters & Filtering

```typescript
// Pagination
GET /api/products?page=1&limit=20

// Filtering
GET /api/products?status=active&category=electronics

// Sorting
GET /api/products?sort=price:asc,name:desc

// Field Selection (GraphQL-like)
GET /api/products?fields=id,name,price

// Search
GET /api/products?search=laptop
```

---

## 🏗️ 3. CODE STRUCTURE & PATTERNS

### 3.1. Controller Pattern (Thin Controllers)

```typescript
// ✅ GOOD: Controller chỉ xử lý HTTP concerns
export class UserController extends BaseController {
  create = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createUserSchema, req.body);
    const user = await userService.create(validated);
    this.created(res, user, SUCCESS_MESSAGES.CREATED);
  });
}

// ❌ BAD: Controller có quá nhiều logic
export class UserController {
  async create(req: Request, res: Response) {
    // Validation logic
    // Database queries
    // Business logic
    // Response formatting
  }
}
```

**Responsibilities:**
- ✅ Validate input (hoặc delegate to middleware)
- ✅ Call service methods
- ✅ Format response
- ❌ Business logic
- ❌ Database queries

### 3.2. Service Pattern (Business Logic Layer)

```typescript
// ✅ GOOD: Service chứa business logic
export class UserService {
  async create(data: CreateUserInput) {
    // Check if email exists
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Create user
    return await prisma.user.create({
      data: { ...data, password: hashedPassword }
    });
  }
}
```

**Responsibilities:**
- ✅ Business logic và validation
- ✅ Data transformation
- ✅ Orchestrate multiple operations
- ✅ Call repositories/data access
- ❌ HTTP concerns
- ❌ Direct database queries (nên qua repository)

### 3.3. Repository Pattern (Data Access Layer)

```typescript
// ✅ GOOD: Repository abstract database operations
export class UserRepository {
  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }
  
  async create(data: CreateUserInput) {
    return await prisma.user.create({ data });
  }
  
  async update(id: string, data: UpdateUserInput) {
    return await prisma.user.update({ where: { id }, data });
  }
}

// Service sử dụng Repository
export class UserService {
  constructor(private userRepo: UserRepository) {}
  
  async create(data: CreateUserInput) {
    // Business logic
    return await this.userRepo.create(data);
  }
}
```

**Benefits:**
- Dễ test (mock repository)
- Dễ đổi database (chỉ đổi repository)
- Tách biệt data access logic

### 3.4. Dependency Injection Pattern

```typescript
// ✅ GOOD: Dependency Injection
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
    private logger: Logger
  ) {}
}

// ❌ BAD: Hard dependencies
export class UserService {
  async create(data: CreateUserInput) {
    const user = await prisma.user.create(...); // Hard dependency
    await sendEmail(...); // Hard dependency
  }
}
```

---

## ✅ 4. VALIDATION & ERROR HANDLING

### 4.1. Input Validation

```typescript
// ✅ GOOD: Centralized validation schemas
// utils/validation.ts
export const ValidationSchemas = {
  uuid: z.string().uuid('ID không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  positiveNumber: z.number().positive('Phải là số dương'),
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng YYYY-MM-DD'),
};

// Controller
const createUserSchema = z.object({
  email: ValidationSchemas.email,
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

const validated = validateOrThrow(createUserSchema, req.body);
```

### 4.2. Error Handling Pattern

```typescript
// ✅ GOOD: Custom Error Classes
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Centralized Error Handler
export function handleError(err: any, res: Response, req?: Request) {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }
  
  if (err instanceof z.ZodError) {
    return sendError(res, ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, err.errors);
  }
  
  // Log unexpected errors
  logger.error('Unexpected error', { error: err, stack: err.stack });
  return sendError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}
```

### 4.3. Error Messages Best Practices

```typescript
// ✅ GOOD: User-friendly messages
ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  USER_NOT_FOUND: 'Không tìm thấy người dùng.',
  EMAIL_ALREADY_EXISTS: 'Email đã tồn tại trong hệ thống.',
}

// ❌ BAD: Technical messages
ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',
  USER_NOT_FOUND: 'User with id xyz not found in database',
}
```

---

## 🔒 5. SECURITY BEST PRACTICES

### 5.1. Authentication & Authorization

```typescript
// ✅ GOOD: JWT với refresh tokens
// Middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  
  const decoded = verifyToken(token);
  req.user = await userService.findById(decoded.userId);
  next();
};

// Role-based authorization
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }
    next();
  };
};
```

### 5.2. Input Sanitization

```typescript
// ✅ GOOD: Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

function sanitizeObject(obj: any): any {
  // Recursively sanitize strings
}
```

### 5.3. Rate Limiting

```typescript
// ✅ GOOD: Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

app.use('/api/', limiter);
```

---

## 📊 6. DATABASE BEST PRACTICES

### 6.1. Query Optimization

```typescript
// ✅ GOOD: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Don't select password
  },
});

// ✅ GOOD: Use indexes
// Prisma schema
model User {
  email String @unique // Indexed
  createdAt DateTime @index
}

// ✅ GOOD: Pagination
const users = await prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

### 6.2. Transactions

```typescript
// ✅ GOOD: Use transactions for multiple operations
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.orderItem.createMany({ data: items });
  await tx.stock.updateMany({ ... });
});
```

### 6.3. Database Migrations

```typescript
// ✅ GOOD: Version control migrations
// prisma/migrations/20240101_add_user_table/migration.sql
```

---

## 🧪 7. TESTING BEST PRACTICES

### 7.1. Test Structure

```typescript
// Unit Tests
describe('UserService', () => {
  describe('create', () => {
    it('should create user successfully', async () => {
      // Arrange
      const mockRepo = { create: jest.fn() };
      const service = new UserService(mockRepo);
      
      // Act
      const result = await service.create(userData);
      
      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith(userData);
    });
  });
});

// Integration Tests
describe('POST /api/users', () => {
  it('should create user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
  });
});
```

### 7.2. Test Coverage

- ✅ Unit tests cho services và utilities
- ✅ Integration tests cho API endpoints
- ✅ E2E tests cho critical flows
- ✅ Mock external dependencies

---

## 📝 8. CODE QUALITY & MAINTAINABILITY

### 8.1. Constants & Configuration

```typescript
// ✅ GOOD: Centralized constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  // ...
} as const;

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  // ...
} as const;

// ❌ BAD: Magic strings/numbers
if (status === 'CREATING') { ... }
res.status(404).json({ ... });
```

### 8.2. Type Safety

```typescript
// ✅ GOOD: Strong typing
interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

async create(data: CreateUserInput): Promise<User> {
  // ...
}

// ❌ BAD: Any types
async create(data: any): Promise<any> {
  // ...
}
```

### 8.3. Code Documentation

```typescript
/**
 * Create a new user
 * @param data - User creation data
 * @returns Created user object
 * @throws {AppError} If email already exists
 */
async create(data: CreateUserInput): Promise<User> {
  // ...
}
```

---

## 🚀 9. PERFORMANCE OPTIMIZATION

### 9.1. Caching

```typescript
// ✅ GOOD: Cache frequently accessed data
import Redis from 'ioredis';

const cache = new Redis();

async function getProduct(id: string) {
  const cached = await cache.get(`product:${id}`);
  if (cached) return JSON.parse(cached);
  
  const product = await productService.findById(id);
  await cache.setex(`product:${id}`, 3600, JSON.stringify(product));
  return product;
}
```

### 9.2. Database Indexing

```typescript
// ✅ GOOD: Index frequently queried fields
model Order {
  userId String @index
  status String @index
  createdAt DateTime @index
}
```

### 9.3. Lazy Loading & Eager Loading

```typescript
// ✅ GOOD: Load relations only when needed
const order = await prisma.order.findUnique({
  where: { id },
  include: {
    items: true, // Only include if needed
  },
});
```

---

## 📦 10. DEPENDENCY MANAGEMENT

### 10.1. Package Organization

```json
// ✅ GOOD: Clear dependencies
{
  "dependencies": {
    "express": "^4.18.0",
    "prisma": "^5.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "typescript": "^5.0.0"
  }
}
```

### 10.2. Version Pinning

- ✅ Use exact versions for critical packages
- ✅ Use caret (^) for minor updates
- ✅ Regular dependency audits

---

## 🔄 11. ASYNC/AWAIT BEST PRACTICES

```typescript
// ✅ GOOD: Proper error handling
try {
  const user = await userService.create(data);
  return this.created(res, user);
} catch (error) {
  // Error handled by middleware
  throw error;
}

// ✅ GOOD: Parallel operations
const [users, products, orders] = await Promise.all([
  userService.getAll(),
  productService.getAll(),
  orderService.getAll(),
]);

// ❌ BAD: Nested callbacks
userService.create(data, (err, user) => {
  if (err) { ... }
  productService.create(..., (err, product) => {
    // ...
  });
});
```

---

## 📋 12. LOGGING BEST PRACTICES

```typescript
// ✅ GOOD: Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('User created', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});
```

---

## 🎯 13. SO SÁNH VỚI PROJECT HIỆN TẠI

### ✅ Đã Áp Dụng Tốt:
1. ✅ Layered architecture (controllers → services)
2. ✅ BaseController pattern
3. ✅ Centralized constants
4. ✅ Standardized API responses
5. ✅ Custom error handling (AppError)
6. ✅ Input validation với Zod
7. ✅ TypeScript type safety
8. ✅ Environment configuration

### 🔄 Có Thể Cải Thiện:
1. ⚠️ **Repository Pattern**: Hiện tại services trực tiếp dùng Prisma, nên tách thành Repository layer
2. ⚠️ **Dependency Injection**: Chưa có DI container, đang dùng singleton pattern
3. ⚠️ **Feature-based Structure**: Có thể tổ chức theo features thay vì layers
4. ⚠️ **API Versioning**: Chưa có versioning
5. ⚠️ **Caching**: Chưa có caching layer
6. ⚠️ **Unit Tests**: Chưa có test coverage
7. ⚠️ **API Documentation**: Có Swagger nhưng có thể cải thiện

---

## 📚 14. TÀI LIỆU THAM KHẢO

### Standards & Guidelines:
- REST API Design: [REST API Tutorial](https://restfulapi.net/)
- TypeScript Best Practices: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- Node.js Best Practices: [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Popular Patterns:
- **Repository Pattern**: Tách data access logic
- **Service Layer Pattern**: Business logic layer
- **Dependency Injection**: Loose coupling
- **Factory Pattern**: Object creation
- **Strategy Pattern**: Algorithm selection

---

## 🎓 KẾT LUẬN

### Key Takeaways:
1. **Separation of Concerns**: Tách biệt rõ ràng giữa layers
2. **DRY Principle**: Tránh lặp lại code
3. **SOLID Principles**: Single Responsibility, Open/Closed, etc.
4. **Type Safety**: Sử dụng TypeScript đúng cách
5. **Error Handling**: Centralized và consistent
6. **API Design**: RESTful, standardized responses
7. **Security**: Authentication, authorization, input validation
8. **Performance**: Caching, indexing, optimization
9. **Testing**: Unit, integration, E2E tests
10. **Documentation**: Code comments, API docs

### Next Steps cho Project:
1. Implement Repository Pattern
2. Add Dependency Injection container
3. Implement caching layer
4. Add comprehensive test coverage
5. Improve API documentation
6. Consider API versioning
7. Add monitoring và logging improvements

---

**Ngày tạo báo cáo**: 2024-11-15
**Phiên bản**: 1.0

