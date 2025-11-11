import { ProductService } from '../../../src/services/product.service';
import prisma from '../../../src/config/database';

// Mock Prisma
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 10000,
          categoryId: 'cat1',
        },
      ];

      (prisma.product.findMany as any).mockResolvedValue(mockProducts);

      const result = await productService.getAll();

      expect(result).toEqual(mockProducts);
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      (prisma.product.findMany as any).mockRejectedValue(new Error('Database error'));

      await expect(productService.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 10000,
      };

      (prisma.product.findUnique as any).mockResolvedValue(mockProduct);

      const result = await productService.findById('1');

      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if product not found', async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      const result = await productService.findById('999');

      expect(result).toBeNull();
    });
  });
});

