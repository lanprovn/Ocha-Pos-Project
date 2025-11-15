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
      count: jest.fn(),
    },
  },
}));

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [
        {
          id: '1',
          orderNumber: 'ORD-123',
          totalAmount: 50000,
          status: 'PENDING',
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.order.findMany as any).mockResolvedValue(mockOrders);
      (prisma.order.count as any).mockResolvedValue(1);

      const result = await orderService.findAll({});

      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination.total).toBe(1);
    });

    it('should handle errors', async () => {
      (prisma.order.findMany as any).mockRejectedValue(new Error('Database error'));

      await expect(orderService.findAll({})).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return order by id', async () => {
      const mockOrder = {
        id: '1',
        orderNumber: 'ORD-123',
        totalAmount: 50000,
        status: 'PENDING',
        customerName: null,
        customerPhone: null,
        customerTable: null,
        notes: null,
        paymentMethod: null,
        paymentStatus: 'PENDING',
        paymentTransactionId: null,
        orderCreator: 'STAFF',
        orderCreatorName: null,
        paidAt: null,
        paymentDate: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        items: [],
      };

      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      const result = await orderService.findById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.orderNumber).toBe('ORD-123');
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    it('should throw error if order not found', async () => {
      (prisma.order.findUnique as any).mockResolvedValue(null);

      await expect(orderService.findById('999')).rejects.toThrow('Order not found');
    });
  });
});

