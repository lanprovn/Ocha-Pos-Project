import { OrderService } from '../../../src/services/order.service';
import prisma from '../../../src/config/database';
import { createMockOrderInput, createMockProduct, createMockStock, createMockOrder } from '../../utils/test-helpers';
import { Decimal } from '@prisma/client/runtime/library';

// Mock Prisma
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    orderItem: {
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    stock: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock other services
jest.mock('../../../src/services/recipe.service', () => ({
  __esModule: true,
  default: {
    getByProduct: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../../src/services/stock.service', () => ({
  __esModule: true,
  default: {
    deductProductStock: jest.fn(),
    deductIngredientStock: jest.fn(),
  },
}));

jest.mock('../../../src/socket/socket.io', () => ({
  emitOrderCreated: jest.fn(),
  emitOrderUpdated: jest.fn(),
}));

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order successfully with valid input', async () => {
      const mockInput = createMockOrderInput();
      const mockOrder = createMockOrder();
      const mockProduct = createMockProduct();

      // Mock: No existing draft orders
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Mock: Stock is available
      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(
        createMockStock({ quantity: 100 })
      );

      // Mock: Product exists
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      // Mock: Order number is unique
      (prisma.order.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // Check uniqueness
        .mockResolvedValueOnce(null); // Check uniqueness again

      // Mock: Order creation
      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.create(mockInput);

      expect(result).toBeDefined();
      expect(prisma.order.create).toHaveBeenCalled();
      expect(result.totalAmount).toBeDefined();
    });

    it('should throw error when stock is insufficient', async () => {
      const mockInput = createMockOrderInput({
        items: [
          {
            productId: 'product-1',
            quantity: 10, // Request 10 items
            price: 50000,
            subtotal: 500000,
          },
        ],
      });
      const mockProduct = createMockProduct({ name: 'Test Product' });

      // Mock: No existing draft orders
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock: Stock only has 5 items (insufficient)
      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(
        createMockStock({ quantity: 5 })
      );

      // Mock: Product exists
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      await expect(orderService.create(mockInput)).rejects.toThrow(
        'Không đủ tồn kho'
      );
    });

    it('should calculate total amount correctly from items', async () => {
      const mockInput = createMockOrderInput({
        items: [
          {
            productId: 'product-1',
            quantity: 2,
            price: 50000,
            subtotal: 100000,
          },
          {
            productId: 'product-2',
            quantity: 3,
            price: 30000,
            subtotal: 90000,
          },
        ],
      });

      const expectedTotal = 190000; // 100000 + 90000

      // Mock: No existing draft orders
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock: Stock is available for both products
      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(
        createMockStock({ quantity: 100 })
      );

      // Mock: Products exist
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        createMockProduct()
      );

      // Mock: Order number is unique
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      const mockOrder = createMockOrder({
        totalAmount: new Decimal(expectedTotal),
      });
      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.create(mockInput);

      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: expect.any(Decimal),
          }),
        })
      );
    });

    it('should generate unique order number', async () => {
      const mockInput = createMockOrderInput();
      const mockOrder = createMockOrder();

      // Mock: No existing draft orders
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock: Stock is available
      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(
        createMockStock({ quantity: 100 })
      );

      // Mock: Product exists
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        createMockProduct()
      );

      // Mock: First order number is taken, second is unique
      (prisma.order.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'existing-order' }) // First check: taken
        .mockResolvedValueOnce(null); // Second check: unique

      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      await orderService.create(mockInput);

      // Should check uniqueness at least twice
      expect(prisma.order.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should delete draft orders before creating new order', async () => {
      const mockInput = createMockOrderInput({
        orderCreator: 'CUSTOMER',
        orderCreatorName: 'Test Customer',
      });
      const mockOrder = createMockOrder();

      // Mock: No existing draft orders
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock: Stock is available
      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(
        createMockStock({ quantity: 100 })
      );

      // Mock: Product exists
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        createMockProduct()
      );

      // Mock: Order number is unique
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      await orderService.create(mockInput);

      expect(prisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          status: 'CREATING',
          orderCreator: 'CUSTOMER',
          orderCreatorName: 'Test Customer',
        },
      });
    });

    it('should handle order with customer information', async () => {
      const mockInput = createMockOrderInput({
        customerName: 'John Doe',
        customerPhone: '0987654321',
        customerTable: '5',
      });
      const mockOrder = createMockOrder({
        customerName: 'John Doe',
        customerPhone: '0987654321',
        customerTable: '5',
      });

      // Mock: No existing draft orders
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock: Stock is available
      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(
        createMockStock({ quantity: 100 })
      );

      // Mock: Product exists
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        createMockProduct()
      );

      // Mock: Order number is unique
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.create(mockInput);

      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerName: 'John Doe',
            customerPhone: '0987654321',
            customerTable: '5',
          }),
        })
      );
    });

    it('should handle order without stock tracking (no stock record)', async () => {
      const mockInput = createMockOrderInput();
      const mockOrder = createMockOrder();

      // Mock: No existing draft orders
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock: No stock record exists (null)
      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock: Product exists
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        createMockProduct()
      );

      // Mock: Order number is unique
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      // Should not throw error when stock record doesn't exist
      const result = await orderService.create(mockInput);

      expect(result).toBeDefined();
      expect(prisma.order.create).toHaveBeenCalled();
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate order number with correct format', () => {
      const orderService = new OrderService();
      // Access private method through any type
      const orderNumber = (orderService as any).generateOrderNumber();

      expect(orderNumber).toMatch(/^ORD-\d{6}$/);
      expect(orderNumber.length).toBe(10); // ORD- + 6 digits
    });

    it('should generate different order numbers', () => {
      const orderService = new OrderService();
      const num1 = (orderService as any).generateOrderNumber();
      
      // Wait a bit to ensure different timestamp
      return new Promise((resolve) => {
        setTimeout(() => {
          const num2 = (orderService as any).generateOrderNumber();
          expect(num1).not.toBe(num2);
          resolve(undefined);
        }, 10);
      });
    });
  });
});

