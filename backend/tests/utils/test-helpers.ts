/**
 * Test utilities and helpers
 */
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Create mock order input for testing
 */
export function createMockOrderInput(overrides?: Partial<any>) {
  return {
    items: [
      {
        productId: 'product-1',
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
    notes: 'Test order',
    paymentMethod: 'CASH' as const,
    paymentStatus: 'PENDING' as const,
    orderCreator: 'STAFF' as const,
    orderCreatorName: 'Test Staff',
    ...overrides,
  };
}

/**
 * Create mock product for testing
 */
export function createMockProduct(overrides?: Partial<any>) {
  return {
    id: 'product-1',
    name: 'Test Product',
    description: 'Test Description',
    price: new Decimal(50000),
    categoryId: 'category-1',
    image: 'test.jpg',
    stock: 10,
    isAvailable: true,
    isPopular: false,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create mock stock for testing
 */
export function createMockStock(overrides?: Partial<any>) {
  return {
    id: 'stock-1',
    productId: 'product-1',
    quantity: 100,
    minStock: 10,
    maxStock: 1000,
    unit: 'pcs',
    isActive: true,
    lastUpdated: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create mock order for testing
 */
export function createMockOrder(overrides?: Partial<any>) {
  return {
    id: 'order-1',
    orderNumber: 'ORD-123456',
    status: 'PENDING',
    totalAmount: new Decimal(100000),
    customerName: 'Test Customer',
    customerPhone: '0123456789',
    customerTable: '1',
    notes: 'Test order',
    paymentMethod: 'CASH',
    paymentStatus: 'PENDING',
    orderCreator: 'STAFF',
    orderCreatorName: 'Test Staff',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'product-1',
        quantity: 2,
        price: new Decimal(50000),
        subtotal: new Decimal(100000),
        selectedSize: null,
        selectedToppings: [],
        note: null,
        createdAt: new Date(),
        product: createMockProduct(),
      },
    ],
    ...overrides,
  };
}

/**
 * Wait for async operations
 */
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock Prisma client for testing
 */
export function createMockPrisma() {
  return {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    stock: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    ingredientStock: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  };
}

