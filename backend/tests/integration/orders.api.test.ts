import request from 'supertest';
import app from '../../src/core/app';
import prisma from '../../src/config/database';
import { createMockOrderInput, createMockProduct, createMockStock } from '../utils/test-helpers';

// Mock authentication middleware for testing
jest.mock('../../src/api/middlewares/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    // Mock user for testing
    req.user = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'STAFF',
    };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

/**
 * Integration Tests cho Orders API
 * 
 * LƯU Ý: Các tests này cần test database thật để chạy.
 * Đảm bảo TEST_DATABASE_URL được set trong .env.test
 * 
 * Để chạy integration tests:
 * 1. Tạo test database: createdb ocha_pos_test
 * 2. Set TEST_DATABASE_URL trong .env.test
 * 3. Chạy migrations: npx prisma migrate deploy
 * 4. Chạy tests: npm run test:integration
 */
describe('Orders API Integration Tests', () => {
  beforeEach(async () => {
    // Skip tests nếu không có test database
    if (!process.env.TEST_DATABASE_URL) {
      console.warn('Skipping integration tests: TEST_DATABASE_URL not set');
      return;
    }
    
    // Clean up test data
    try {
      await prisma.orderItem.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.stock.deleteMany({});
      await prisma.product.deleteMany({});
    } catch (error) {
      console.warn('Database cleanup failed:', error);
    }
  });

  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      // Ignore disconnect errors
    }
  });

  describe('POST /api/orders', () => {
    it('should create order successfully with valid data', async () => {
      if (!process.env.TEST_DATABASE_URL) {
        console.warn('Skipping test: TEST_DATABASE_URL not set');
        return;
      }
      // Setup: Create product and stock
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 50000,
          stock: 100,
          isAvailable: true,
        },
      });

      await prisma.stock.create({
        data: {
          productId: product.id,
          quantity: 100,
          minStock: 10,
          unit: 'pcs',
        },
      });

      const orderData = {
        items: [
          {
            productId: product.id,
            quantity: 2,
            price: 50000,
            subtotal: 100000,
            selectedSize: null,
            selectedToppings: [],
            note: null,
          },
        ],
        customerName: 'Test Customer',
        customerPhone: '0123456789',
        customerTable: '1',
        paymentMethod: 'CASH',
        orderCreator: 'STAFF',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('orderNumber');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.totalAmount).toBeDefined();
      expect(response.body.items).toHaveLength(1);
    });

    it('should return 400 for invalid order data', async () => {
      if (!process.env.TEST_DATABASE_URL) {
        console.warn('Skipping test: TEST_DATABASE_URL not set');
        return;
      }
      const invalidOrderData = {
        items: [], // Empty items array
        customerName: 'Test Customer',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrderData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation error');
    });

    it('should return error when stock is insufficient', async () => {
      if (!process.env.TEST_DATABASE_URL) {
        console.warn('Skipping test: TEST_DATABASE_URL not set');
        return;
      }
      // Setup: Create product with low stock
      const product = await prisma.product.create({
        data: {
          name: 'Low Stock Product',
          price: 50000,
          stock: 5,
          isAvailable: true,
        },
      });

      await prisma.stock.create({
        data: {
          productId: product.id,
          quantity: 5, // Only 5 available
          minStock: 10,
          unit: 'pcs',
        },
      });

      const orderData = {
        items: [
          {
            productId: product.id,
            quantity: 10, // Request 10, but only 5 available
            price: 50000,
            subtotal: 500000,
            selectedSize: null,
            selectedToppings: [],
            note: null,
          },
        ],
        paymentMethod: 'CASH',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(500);

      expect(response.body.error).toContain('Không đủ tồn kho');
    });

    it('should calculate total amount correctly for multiple items', async () => {
      if (!process.env.TEST_DATABASE_URL) {
        console.warn('Skipping test: TEST_DATABASE_URL not set');
        return;
      }
      // Setup: Create products
      const product1 = await prisma.product.create({
        data: {
          name: 'Product 1',
          price: 50000,
          stock: 100,
          isAvailable: true,
        },
      });

      const product2 = await prisma.product.create({
        data: {
          name: 'Product 2',
          price: 30000,
          stock: 100,
          isAvailable: true,
        },
      });

      await prisma.stock.createMany({
        data: [
          {
            productId: product1.id,
            quantity: 100,
            minStock: 10,
            unit: 'pcs',
          },
          {
            productId: product2.id,
            quantity: 100,
            minStock: 10,
            unit: 'pcs',
          },
        ],
      });

      const orderData = {
        items: [
          {
            productId: product1.id,
            quantity: 2,
            price: 50000,
            subtotal: 100000,
            selectedSize: null,
            selectedToppings: [],
            note: null,
          },
          {
            productId: product2.id,
            quantity: 3,
            price: 30000,
            subtotal: 90000,
            selectedSize: null,
            selectedToppings: [],
            note: null,
          },
        ],
        paymentMethod: 'CASH',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      // Total should be 100000 + 90000 = 190000
      expect(parseFloat(response.body.totalAmount)).toBe(190000);
    });
  });

  describe('GET /api/orders', () => {
    it('should return list of orders', async () => {
      if (!process.env.TEST_DATABASE_URL) {
        console.warn('Skipping test: TEST_DATABASE_URL not set');
        return;
      }
      // Setup: Create a test order
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 50000,
          stock: 100,
          isAvailable: true,
        },
      });

      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-TEST-001',
          status: 'PENDING',
          totalAmount: 100000,
          items: {
            create: {
              productId: product.id,
              quantity: 2,
              price: 50000,
              subtotal: 100000,
            },
          },
        },
      });

      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter orders by status', async () => {
      if (!process.env.TEST_DATABASE_URL) {
        console.warn('Skipping test: TEST_DATABASE_URL not set');
        return;
      }
      // Setup: Create orders with different statuses
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 50000,
          stock: 100,
          isAvailable: true,
        },
      });

      await prisma.order.createMany({
        data: [
          {
            orderNumber: 'ORD-PENDING-001',
            status: 'PENDING',
            totalAmount: 100000,
          },
          {
            orderNumber: 'ORD-COMPLETED-001',
            status: 'COMPLETED',
            totalAmount: 200000,
          },
        ],
      });

      const response = await request(app)
        .get('/api/orders?status=PENDING')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // All returned orders should have PENDING status
      response.body.forEach((order: any) => {
        expect(order.status).toBe('PENDING');
      });
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order by id', async () => {
      if (!process.env.TEST_DATABASE_URL) {
        console.warn('Skipping test: TEST_DATABASE_URL not set');
        return;
      }
      // Setup: Create a test order
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 50000,
          stock: 100,
          isAvailable: true,
        },
      });

      const order = await prisma.order.create({
        data: {
          orderNumber: 'ORD-TEST-002',
          status: 'PENDING',
          totalAmount: 100000,
          items: {
            create: {
              productId: product.id,
              quantity: 2,
              price: 50000,
              subtotal: 100000,
            },
          },
        },
        include: {
          items: true,
        },
      });

      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .expect(200);

      expect(response.body.id).toBe(order.id);
      expect(response.body.orderNumber).toBe('ORD-TEST-002');
      expect(response.body.items).toBeDefined();
    });

    it('should return 404 for non-existent order', async () => {
      if (!process.env.TEST_DATABASE_URL) {
        console.warn('Skipping test: TEST_DATABASE_URL not set');
        return;
      }
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/orders/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});

