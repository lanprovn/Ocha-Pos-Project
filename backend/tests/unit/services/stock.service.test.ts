import { StockService } from '../../../src/services/stock.service';
import prisma from '../../../src/config/database';
import { createMockStock, createMockProduct } from '../../utils/test-helpers';

// Mock Prisma
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    stock: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    ingredientStock: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    ingredient: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../../src/socket/socket.io', () => ({
  emitStockUpdated: jest.fn(),
  emitStockAlert: jest.fn(),
}));

describe('StockService', () => {
  let stockService: StockService;

  beforeEach(() => {
    stockService = new StockService();
    jest.clearAllMocks();
  });

  describe('updateProductStock', () => {
    it('should update stock quantity successfully', async () => {
      const stockId = 'stock-1';
      const mockStock = createMockStock({ id: stockId, quantity: 100 });
      const updatedStock = createMockStock({ id: stockId, quantity: 150 });

      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);
      (prisma.stock.update as jest.Mock).mockResolvedValue(updatedStock);

      const result = await stockService.updateProductStock(stockId, {
        quantity: 150,
      });

      expect(prisma.stock.update).toHaveBeenCalledWith({
        where: { id: stockId },
        data: expect.objectContaining({
          quantity: 150,
          lastUpdated: expect.any(Date),
        }),
      });

      expect(result).toBeDefined();
    });

    it('should throw error when stock not found', async () => {
      const stockId = 'non-existent-stock';

      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        stockService.updateProductStock(stockId, { quantity: 100 })
      ).rejects.toThrow('Product stock not found');
    });

    it('should update minStock and maxStock', async () => {
      const stockId = 'stock-1';
      const mockStock = createMockStock({ id: stockId });

      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);
      (prisma.stock.update as jest.Mock).mockResolvedValue({
        ...mockStock,
        minStock: 20,
        maxStock: 500,
      });

      await stockService.updateProductStock(stockId, {
        minStock: 20,
        maxStock: 500,
      });

      expect(prisma.stock.update).toHaveBeenCalledWith({
        where: { id: stockId },
        data: expect.objectContaining({
          minStock: 20,
          maxStock: 500,
        }),
      });
    });
  });

  describe('deductProductStock', () => {
    it('should deduct stock quantity successfully', async () => {
      const productId = 'product-1';
      const quantity = 10;
      const mockStock = createMockStock({
        productId,
        quantity: 100,
      });

      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);
      (prisma.stock.update as jest.Mock).mockResolvedValue({
        ...mockStock,
        quantity: 90, // 100 - 10
      });

      await stockService.deductProductStock(productId, quantity);

      expect(prisma.stock.update).toHaveBeenCalledWith({
        where: { productId },
        data: {
          quantity: 90,
          lastUpdated: expect.any(Date),
        },
      });
    });

    it('should throw error when stock is insufficient', async () => {
      const productId = 'product-1';
      const quantity = 150; // Request more than available
      const mockStock = createMockStock({
        productId,
        quantity: 100, // Only 100 available
      });

      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);

      await expect(
        stockService.deductProductStock(productId, quantity)
      ).rejects.toThrow('Không đủ tồn kho');
    });

    it('should handle product without stock record', async () => {
      const productId = 'product-without-stock';
      const quantity = 10;

      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(null);

      // Should not throw error, just skip deduction
      await expect(
        stockService.deductProductStock(productId, quantity)
      ).resolves.not.toThrow();
    });
  });

  describe('checkLowStockAlerts', () => {
    it('should create alert when stock is below minimum', async () => {
      const mockStock = createMockStock({
        quantity: 5,
        minStock: 10, // Below minimum
      });

      (prisma.stock.findMany as jest.Mock).mockResolvedValue([mockStock]);

      // Mock product
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(
        createMockProduct({ id: mockStock.productId })
      );

      await stockService.checkLowStockAlerts();

      // Should check for low stock products
      expect(prisma.stock.findMany).toHaveBeenCalled();
    });

    it('should not create alert when stock is above minimum', async () => {
      const mockStock = createMockStock({
        quantity: 50,
        minStock: 10, // Above minimum
      });

      (prisma.stock.findMany as jest.Mock).mockResolvedValue([mockStock]);

      await stockService.checkLowStockAlerts();

      // Should still check, but no alerts created
      expect(prisma.stock.findMany).toHaveBeenCalled();
    });
  });

  describe('getAllProductStocks', () => {
    it('should return all product stocks with product information', async () => {
      const mockStocks = [
        createMockStock({ productId: 'product-1' }),
        createMockStock({ productId: 'product-2' }),
      ];

      (prisma.stock.findMany as jest.Mock).mockResolvedValue(mockStocks);

      const result = await stockService.getAllProductStocks();

      expect(prisma.stock.findMany).toHaveBeenCalledWith({
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          lastUpdated: 'desc',
        },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getProductStockById', () => {
    it('should return stock by id', async () => {
      const stockId = 'stock-1';
      const mockStock = createMockStock({ id: stockId });

      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);

      const result = await stockService.getProductStockById(stockId);

      expect(prisma.stock.findUnique).toHaveBeenCalledWith({
        where: { id: stockId },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });

      expect(result).toBeDefined();
    });

    it('should throw error when stock not found', async () => {
      const stockId = 'non-existent-stock';

      (prisma.stock.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        stockService.getProductStockById(stockId)
      ).rejects.toThrow('Product stock not found');
    });
  });
});

