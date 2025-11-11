import { OrderService } from '../../../src/services/order.service';
import prisma from '../../../src/config/database';

// Mock Prisma
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all orders', async () => {
      const mockOrders = [
        {
          id: '1',
          orderNumber: 'ORD-123',
          totalAmount: 50000,
          status: 'PENDING',
        },
      ];

      (prisma.order.findMany as any).mockResolvedValue(mockOrders);

      const result = await orderService.getAll({});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle errors', async () => {
      (prisma.order.findMany as any).mockRejectedValue(new Error('Database error'));

      await expect(orderService.getAll({})).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return order by id', async () => {
      const mockOrder = {
        id: '1',
        orderNumber: 'ORD-123',
        totalAmount: 50000,
      };

      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      const result = await orderService.findById('1');

      expect(result).toEqual(mockOrder);
      expect(prisma.order.findUnique).toHaveBeenCalled();
    });

    it('should return null if order not found', async () => {
      (prisma.order.findUnique as any).mockResolvedValue(null);

      const result = await orderService.findById('999');

      expect(result).toBeNull();
    });
  });
});

