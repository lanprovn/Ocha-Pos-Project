# Testing Guide

Hướng dẫn chạy tests cho OCHA POS Backend.

## Cấu trúc Tests

```
backend/tests/
├── unit/              # Unit tests cho services, utils
│   ├── services/      # Tests cho business logic
│   └── utils/         # Tests cho utilities
├── integration/        # Integration tests cho API endpoints
└── setup.ts           # Test setup và configuration
```

## Chạy Tests

### Chạy tất cả tests
```bash
npm test
```

### Chạy unit tests only
```bash
npm run test:unit
```

### Chạy integration tests only
```bash
npm run test:integration
```

### Chạy tests với watch mode
```bash
npm run test:watch
```

### Chạy tests với coverage report
```bash
npm run test:coverage
```

## Test Coverage

Mục tiêu coverage:
- **Services**: > 80%
- **Controllers**: > 70%
- **Utils**: > 90%

## Viết Tests Mới

### Unit Test Example

```typescript
import { OrderService } from '../../../src/services/order.service';
import prisma from '../../../src/config/database';

jest.mock('../../../src/config/database');

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  it('should create order successfully', async () => {
    // Test implementation
  });
});
```

### Integration Test Example

```typescript
import request from 'supertest';
import app from '../../src/app';

describe('Orders API', () => {
  it('should create order via API', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send(orderData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

## Best Practices

1. **Isolate tests**: Mỗi test phải độc lập, không phụ thuộc vào test khác
2. **Mock external dependencies**: Mock database, external APIs
3. **Test edge cases**: Test cả success và error cases
4. **Descriptive names**: Tên test phải mô tả rõ ràng điều gì đang được test
5. **Arrange-Act-Assert**: Cấu trúc test theo pattern AAA

## Test Database

Integration tests sử dụng test database riêng. Đảm bảo:
- `TEST_DATABASE_URL` được set trong `.env.test`
- Test database được clean up sau mỗi test suite

