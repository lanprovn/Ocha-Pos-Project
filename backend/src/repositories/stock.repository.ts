import prisma from '../config/database';
import { BaseRepository } from './base.repository';
import {
  CreateProductStockInput,
  CreateIngredientInput,
  UpdateStockProductInput,
  UpdateStockIngredientInput,
  StockFilters,
} from '../types/stock.types';

export class StockRepository extends BaseRepository<any> {
  protected model = prisma.stock;

  // ========== Product Stock ==========

  /**
   * Get all product stocks with product info
   */
  async findAllProductStocks() {
    return prisma.stock.findMany({
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
  }

  /**
   * Find product stock by ID
   */
  async findProductStockById(id: string) {
    return prisma.stock.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Find product stock by productId
   */
  async findProductStockByProductId(productId: string) {
    return prisma.stock.findUnique({
      where: { productId },
    });
  }

  /**
   * Find multiple product stocks by productIds
   */
  async findProductStocksByProductIds(productIds: string[]) {
    return prisma.stock.findMany({
      where: { productId: { in: productIds } },
    });
  }

  /**
   * Create product stock
   */
  async createProductStock(data: CreateProductStockInput) {
    return prisma.stock.create({
      data: {
        productId: data.productId,
        quantity: data.quantity ?? 0,
        minStock: data.minStock ?? 0,
        maxStock: data.maxStock ?? 0,
        unit: data.unit ?? 'pcs',
        isActive: data.isActive ?? true,
        lastUpdated: new Date(),
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Update product stock
   */
  async updateProductStock(id: string, data: UpdateStockProductInput) {
    const updateData: any = {};
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.minStock !== undefined) updateData.minStock = data.minStock;
    if (data.maxStock !== undefined) updateData.maxStock = data.maxStock;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    updateData.lastUpdated = new Date();

    return prisma.stock.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Update product stock quantity (for transactions)
   */
  async updateProductStockQuantity(productId: string, quantityChange: number, reservedChange?: number) {
    const updateData: any = {
      quantity: { increment: quantityChange },
      lastUpdated: new Date(),
    };

    if (reservedChange !== undefined) {
      updateData.reservedQuantity = { increment: reservedChange };
    }

    return prisma.stock.update({
      where: { productId },
      data: updateData,
    });
  }

  // ========== Ingredient Stock ==========

  /**
   * Get all ingredient stocks
   */
  async findAllIngredientStocks() {
    return prisma.ingredientStock.findMany({
      include: {
        ingredient: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });
  }

  /**
   * Find ingredient stock by ID
   */
  async findIngredientStockById(id: string) {
    return prisma.ingredientStock.findUnique({
      where: { id },
      include: {
        ingredient: true,
      },
    });
  }

  /**
   * Find ingredient stock by ingredientId
   */
  async findIngredientStockByIngredientId(ingredientId: string) {
    return prisma.ingredientStock.findUnique({
      where: { ingredientId },
    });
  }

  /**
   * Create ingredient with stock
   */
  async createIngredientWithStock(data: CreateIngredientInput) {
    const ingredient = await prisma.ingredient.create({
      data: {
        name: data.name,
        unit: data.unit,
      },
    });

    const stock = await prisma.ingredientStock.create({
      data: {
        ingredientId: ingredient.id,
        quantity: data.quantity ?? 0,
        minStock: data.minStock ?? 0,
        maxStock: data.maxStock ?? 0,
        isActive: data.isActive ?? true,
        lastUpdated: new Date(),
      },
      include: {
        ingredient: true,
      },
    });

    return stock;
  }

  /**
   * Update ingredient stock
   */
  async updateIngredientStock(id: string, data: UpdateStockIngredientInput) {
    const updateData: any = {};
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.minStock !== undefined) updateData.minStock = data.minStock;
    if (data.maxStock !== undefined) updateData.maxStock = data.maxStock;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    updateData.lastUpdated = new Date();

    return prisma.ingredientStock.update({
      where: { id },
      data: updateData,
      include: {
        ingredient: true,
      },
    });
  }

  /**
   * Update ingredient info
   */
  async updateIngredient(ingredientId: string, data: { name?: string; unit?: string }) {
    return prisma.ingredient.update({
      where: { id: ingredientId },
      data,
    });
  }

  /**
   * Update ingredient stock quantity (for transactions)
   */
  async updateIngredientStockQuantity(ingredientId: string, quantityChange: number) {
    return prisma.ingredientStock.update({
      where: { ingredientId },
      data: {
        quantity: { increment: quantityChange },
        lastUpdated: new Date(),
      },
    });
  }

  // ========== Stock Transactions ==========

  /**
   * Create stock transaction
   */
  async createStockTransaction(data: any) {
    return prisma.stockTransaction.create({
      data,
      include: {
        product: true,
        ingredient: true,
      },
    });
  }

  /**
   * Get stock transactions with filters
   */
  async findStockTransactions(filters: StockFilters, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.productId) {
      where.productId = filters.productId;
    }
    if (filters.ingredientId) {
      where.ingredientId = filters.ingredientId;
    }
    if (filters.startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    const [total, transactions] = await Promise.all([
      prisma.stockTransaction.count({ where }),
      prisma.stockTransaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: true,
          ingredient: true,
        },
      orderBy: {
        timestamp: 'desc',
      },
      }),
    ]);

    return { transactions, total };
  }

  // ========== Stock Alerts ==========

  /**
   * Create stock alert
   */
  async createStockAlert(data: {
    productId: string | null;
    ingredientId: string | null;
    type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
    message: string;
    isRead: boolean;
  }) {
    return prisma.stockAlert.create({
      data: {
        productId: data.productId,
        ingredientId: data.ingredientId,
        type: data.type,
        message: data.message,
        isRead: data.isRead,
      },
      include: {
        product: true,
        ingredient: true,
      },
    });
  }

  /**
   * Get stock alerts with filters
   */
  async findStockAlerts(filters: StockFilters, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.productId) {
      where.productId = filters.productId;
    }
    if (filters.ingredientId) {
      where.ingredientId = filters.ingredientId;
    }
    if (filters.isResolved !== undefined) {
      where.isResolved = filters.isResolved;
    }

    const [total, alerts] = await Promise.all([
      prisma.stockAlert.count({ where }),
      prisma.stockAlert.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: true,
          ingredient: true,
        },
      orderBy: {
        timestamp: 'desc',
      },
      }),
    ]);

    return { alerts, total };
  }

  /**
   * Update stock alert
   */
  async updateStockAlert(id: string, data: { isResolved?: boolean; isRead?: boolean; resolvedAt?: Date }) {
    const updateData: any = {};
    if (data.isResolved !== undefined) updateData.isResolved = data.isResolved;
    if (data.isRead !== undefined) updateData.isRead = data.isRead;
    if (data.resolvedAt !== undefined) updateData.resolvedAt = data.resolvedAt;

    return prisma.stockAlert.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        ingredient: true,
      },
    });
  }
}

export default new StockRepository();

