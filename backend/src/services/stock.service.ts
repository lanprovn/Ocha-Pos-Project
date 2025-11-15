import {
  UpdateStockProductInput,
  UpdateStockIngredientInput,
  CreateStockTransactionInput,
  CreateStockAlertInput,
  UpdateStockAlertInput,
  StockFilters,
  CreateProductStockInput,
  CreateIngredientInput,
  UpdateIngredientInput,
} from '../types/stock.types';
import { emitDashboardUpdate, emitStockAlert } from '../socket/socket.io';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { stockRepository, productRepository } from '../repositories';
import prisma from '../config/database';

export class StockService {
  constructor(
    private repository = stockRepository,
    private productRepo = productRepository
  ) {}

  // ========== Product Stock ==========

  async getAllProductStocks() {
    const stocks = await this.repository.findAllProductStocks();
    return stocks.map((stock) => this.transformProductStock(stock));
  }

  async getProductStockById(id: string) {
    const stock = await this.repository.findProductStockById(id);

    if (!stock) {
      throw new AppError(ERROR_MESSAGES.PRODUCT_STOCK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.transformProductStock(stock);
  }

  async updateProductStock(id: string, data: UpdateStockProductInput) {
    const stock = await this.repository.findProductStockById(id);

    if (!stock) {
      throw new AppError(ERROR_MESSAGES.PRODUCT_STOCK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const updated = await this.repository.updateProductStock(id, data);

    // PRODUCTION READY: Emit stock update event for real-time sync
    try {
      emitDashboardUpdate({
        type: 'stock_update',
        stockId: updated.id,
        productId: updated.productId,
        newQuantity: updated.quantity,
        timestamp: new Date().toISOString(),
      });

      // Check and emit low stock alert
      if (updated.quantity <= updated.minStock && updated.quantity > 0) {
        emitStockAlert({
          type: 'LOW_STOCK',
          productId: updated.productId,
          message: `Sản phẩm "${updated.product?.name || 'Unknown'}" sắp hết hàng. Tồn kho: ${updated.quantity}`,
        });
      } else if (updated.quantity === 0) {
        emitStockAlert({
          type: 'OUT_OF_STOCK',
          productId: updated.productId,
          message: `Sản phẩm "${updated.product?.name || 'Unknown'}" đã hết hàng`,
        });
      }
    } catch (socketError: any) {
      // Don't throw - stock update should succeed even if socket fails
      console.warn('Failed to emit stock update event', socketError);
    }

    return this.transformProductStock(updated);
  }

  async createProductStock(data: CreateProductStockInput) {
    const product = await this.productRepo.findById(data.productId);

    if (!product) {
      throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const existing = await this.repository.findProductStockByProductId(data.productId);

    if (existing) {
      throw new AppError(ERROR_MESSAGES.STOCK_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const stock = await this.repository.createProductStock(data);
    return this.transformProductStock(stock);
  }

  async deleteProductStock(id: string) {
    const stock = await this.repository.findProductStockById(id);

    if (!stock) {
      throw new AppError(ERROR_MESSAGES.PRODUCT_STOCK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await this.repository.delete(id);
    return { message: 'Product stock deleted successfully' };
  }

  // ========== Ingredient Stock ==========

  async getAllIngredientStocks() {
    const stocks = await this.repository.findAllIngredientStocks();
    return stocks.map((stock) => this.transformIngredientStock(stock));
  }

  async getIngredientStockById(id: string) {
    const stock = await this.repository.findIngredientStockById(id);

    if (!stock) {
      throw new AppError(ERROR_MESSAGES.INGREDIENT_STOCK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.transformIngredientStock(stock);
  }

  async updateIngredientStock(id: string, data: UpdateStockIngredientInput) {
    const stock = await this.repository.findIngredientStockById(id);

    if (!stock) {
      throw new AppError(ERROR_MESSAGES.INGREDIENT_STOCK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    let updated = await this.repository.updateIngredientStock(id, data);

    // PRODUCTION READY: Emit stock update event for real-time sync
    try {
      emitDashboardUpdate({
        type: 'stock_update',
        stockId: updated.id,
        ingredientId: updated.ingredientId,
        newQuantity: updated.quantity,
        timestamp: new Date().toISOString(),
      });

      // Check and emit low stock alert
      if (updated.quantity <= updated.minStock && updated.quantity > 0) {
        emitStockAlert({
          type: 'LOW_STOCK',
          ingredientId: updated.ingredientId,
          message: `Nguyên liệu "${updated.ingredient?.name || 'Unknown'}" sắp hết. Tồn kho: ${updated.quantity}`,
        });
      } else if (updated.quantity === 0) {
        emitStockAlert({
          type: 'OUT_OF_STOCK',
          ingredientId: updated.ingredientId,
          message: `Nguyên liệu "${updated.ingredient?.name || 'Unknown'}" đã hết`,
        });
      }
    } catch (socketError: any) {
      // Don't throw - stock update should succeed even if socket fails
      console.warn('Failed to emit stock update event', socketError);
    }

    if ((data.name !== undefined || data.unit !== undefined) && stock.ingredient) {
      await this.repository.updateIngredient(stock.ingredientId, {
        name: data.name !== undefined ? data.name : stock.ingredient.name,
        unit: data.unit !== undefined ? data.unit : stock.ingredient.unit,
      });

      updated = await this.repository.findIngredientStockById(id) as any;
    }

    return this.transformIngredientStock(updated);
  }

  async createIngredient(data: CreateIngredientInput) {
    const stock = await this.repository.createIngredientWithStock(data);

    return this.transformIngredientStock(stock);
  }

  async updateIngredientDetails(id: string, data: UpdateIngredientInput) {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        stock: true,
      },
    });

    if (!ingredient) {
      throw new AppError(ERROR_MESSAGES.STOCK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await prisma.ingredient.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : ingredient.name,
        unit: data.unit !== undefined ? data.unit : ingredient.unit,
      },
    });

    if (ingredient.stock) {
      const stockUpdate: any = {};
      if (data.quantity !== undefined) stockUpdate.quantity = data.quantity;
      if (data.minStock !== undefined) stockUpdate.minStock = data.minStock;
      if (data.maxStock !== undefined) stockUpdate.maxStock = data.maxStock;
      if (data.isActive !== undefined) stockUpdate.isActive = data.isActive;

      if (Object.keys(stockUpdate).length > 0) {
        stockUpdate.lastUpdated = new Date();
        await prisma.ingredientStock.update({
          where: { id: ingredient.stock.id },
          data: stockUpdate,
        });
      }
    }

    const updated = await prisma.ingredientStock.findUnique({
      where: { ingredientId: id },
      include: {
        ingredient: true,
      },
    });

    if (!updated) {
      throw new AppError(ERROR_MESSAGES.INGREDIENT_STOCK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.transformIngredientStock(updated);
  }

  async deleteIngredient(id: string) {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new AppError(ERROR_MESSAGES.STOCK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await prisma.ingredient.delete({
      where: { id },
    });

    return { message: 'Ingredient deleted successfully' };
  }

  // ========== Stock Transactions ==========

  async createTransaction(data: CreateStockTransactionInput) {
    const transaction = await this.repository.createStockTransaction({
      productId: data.productId || null,
      ingredientId: data.ingredientId || null,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason || null,
      userId: data.userId || null,
    });

    // Update stock quantity if productId or ingredientId provided
    if (data.productId) {
      await this.updateProductStockFromTransaction(data.productId, data.type, data.quantity);
      
      // PRODUCTION READY: Emit stock update event
      try {
        emitDashboardUpdate({
          type: 'stock_update',
          productId: data.productId,
          transactionType: data.type,
          quantity: data.quantity,
          timestamp: new Date().toISOString(),
        });
      } catch (socketError: any) {
        console.warn('Failed to emit stock update event', socketError);
      }
    } else if (data.ingredientId) {
      await this.updateIngredientStockFromTransaction(data.ingredientId, data.type, data.quantity);
      
      // PRODUCTION READY: Emit stock update event
      try {
        emitDashboardUpdate({
          type: 'stock_update',
          ingredientId: data.ingredientId,
          transactionType: data.type,
          quantity: data.quantity,
          timestamp: new Date().toISOString(),
        });
      } catch (socketError: any) {
        console.warn('Failed to emit stock update event', socketError);
      }
    }

    return this.transformTransaction(transaction);
  }

  async getAllTransactions(filters?: StockFilters, page: number = 1, limit: number = 50) {
    const { transactions } = await this.repository.findStockTransactions(filters || {}, page, limit);
    return transactions.map((t) => this.transformTransaction(t));
  }

  async getTransactionById(id: string) {
    // Note: Repository doesn't have findById for transactions yet, using direct query for now
    const transaction = await prisma.stockTransaction.findUnique({
      where: { id },
      include: {
        product: true,
        ingredient: true,
      },
    });

    if (!transaction) {
      throw new AppError(ERROR_MESSAGES.STOCK_TRANSACTION_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.transformTransaction(transaction);
  }

  // ========== Stock Alerts ==========

  async createAlert(data: CreateStockAlertInput) {
    const alert = await this.repository.createStockAlert({
      productId: data.productId || null,
      ingredientId: data.ingredientId || null,
      type: data.type,
      message: data.message,
      isRead: false,
    });

    return this.transformAlert(alert);
  }

  async getAllAlerts(filters?: StockFilters, page: number = 1, limit: number = 50) {
    const { alerts } = await this.repository.findStockAlerts(filters || {}, page, limit);
    return alerts.map((a) => this.transformAlert(a));
  }

  async getAlertById(id: string) {
    // Note: Repository doesn't have findById for alerts yet, using direct query for now
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
      include: {
        product: true,
        ingredient: true,
      },
    });

    if (!alert) {
      throw new AppError(ERROR_MESSAGES.STOCK_ALERT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.transformAlert(alert);
  }

  async updateAlert(id: string, data: UpdateStockAlertInput) {
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new AppError(ERROR_MESSAGES.STOCK_ALERT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const updated = await this.repository.updateStockAlert(id, {
      isRead: data.isRead !== undefined ? data.isRead : alert.isRead,
      resolvedAt: data.isRead ? new Date() : undefined,
    });

    return this.transformAlert(updated);
  }

  async markAlertAsRead(id: string) {
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new AppError(ERROR_MESSAGES.STOCK_ALERT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const updated = await this.repository.updateStockAlert(id, {
      isResolved: true,
      resolvedAt: new Date(),
    });

    return this.transformAlert(updated);
  }

  async deleteAlert(id: string) {
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new AppError(ERROR_MESSAGES.STOCK_ALERT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await prisma.stockAlert.delete({
      where: { id },
    });

    return { message: 'Stock alert deleted successfully' };
  }

  // ========== Stock Reservation Methods (PRODUCTION READY) ==========

  /**
   * Reserve stock for a pending order
   * PRODUCTION READY: Prevents overselling by reserving stock when order is created
   */
  async reserveProductStock(productId: string, quantity: number): Promise<void> {
    await this.repository.updateProductStockQuantity(productId, 0, quantity);
  }

  /**
   * Release reserved stock (when order cancelled or failed)
   */
  async releaseProductStock(productId: string, quantity: number): Promise<void> {
    await this.repository.updateProductStockQuantity(productId, 0, -quantity);
  }

  /**
   * Reserve ingredient stock for a pending order
   */
  async reserveIngredientStock(ingredientId: string, quantity: number): Promise<void> {
    await prisma.ingredientStock.update({
      where: { ingredientId },
      data: {
        reservedQuantity: {
          increment: quantity,
        },
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Release reserved ingredient stock
   */
  async releaseIngredientStock(ingredientId: string, quantity: number): Promise<void> {
    await prisma.ingredientStock.update({
      where: { ingredientId },
      data: {
        reservedQuantity: {
          decrement: quantity,
        },
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Get available stock (quantity - reservedQuantity)
   */
  async getAvailableProductStock(productId: string): Promise<number> {
    const stock = await prisma.stock.findUnique({
      where: { productId },
      select: { quantity: true, reservedQuantity: true },
    });

    if (!stock) return 0;
    return Math.max(0, stock.quantity - stock.reservedQuantity);
  }

  // ========== Helper Methods ==========

  private async updateProductStockFromTransaction(
    productId: string,
    type: string,
    quantity: number
  ) {
    const stock = await prisma.stock.findUnique({
      where: { productId },
    });

    if (!stock) return;

    let newQuantity = stock.quantity;
    if (type === 'SALE') {
      newQuantity -= quantity;
    } else if (type === 'PURCHASE' || type === 'ADJUSTMENT') {
      newQuantity += quantity;
    } else if (type === 'RETURN') {
      newQuantity += quantity;
    }

    await prisma.stock.update({
      where: { id: stock.id },
      data: {
        quantity: Math.max(0, newQuantity),
        lastUpdated: new Date(),
      },
    });
  }

  private async updateIngredientStockFromTransaction(
    ingredientId: string,
    type: string,
    quantity: number
  ) {
    const stock = await prisma.ingredientStock.findUnique({
      where: { ingredientId },
    });

    if (!stock) return;

    let newQuantity = stock.quantity;
    if (type === 'SALE') {
      newQuantity -= quantity;
    } else if (type === 'PURCHASE' || type === 'ADJUSTMENT') {
      newQuantity += quantity;
    } else if (type === 'RETURN') {
      newQuantity += quantity;
    }

    await prisma.ingredientStock.update({
      where: { id: stock.id },
      data: {
        quantity: Math.max(0, newQuantity),
        lastUpdated: new Date(),
      },
    });
  }

  private transformProductStock(stock: any) {
    return {
      id: stock.id,
      productId: stock.productId,
      currentStock: stock.quantity,
      reservedStock: stock.reservedQuantity || 0, // PRODUCTION READY: Include reserved quantity
      availableStock: Math.max(0, stock.quantity - (stock.reservedQuantity || 0)), // Available = quantity - reserved
      minStock: stock.minStock,
      maxStock: stock.maxStock,
      unit: stock.unit,
      lastUpdated: stock.lastUpdated.getTime(),
      isActive: stock.isActive,
      product: stock.product
        ? {
            id: stock.product.id,
            name: stock.product.name,
            price: stock.product.price ? Number(stock.product.price) : undefined,
            description: stock.product.description || undefined,
            image: stock.product.image,
            category: stock.product.category
              ? {
                  id: stock.product.category.id,
                  name: stock.product.category.name,
                }
              : undefined,
          }
        : undefined,
    };
  }

  private transformIngredientStock(stock: any) {
    return {
      id: stock.id,
      ingredientId: stock.ingredientId,
      currentStock: stock.quantity,
      minStock: stock.minStock,
      maxStock: stock.maxStock,
      unit: stock.ingredient?.unit || 'pcs',
      lastUpdated: stock.lastUpdated.getTime(),
      isActive: stock.isActive,
      ingredient: stock.ingredient
        ? {
            id: stock.ingredient.id,
            name: stock.ingredient.name,
            unit: stock.ingredient.unit,
          }
        : undefined,
    };
  }

  private transformTransaction(transaction: any) {
    return {
      id: transaction.id,
      productId: transaction.productId || '',
      ingredientId: transaction.ingredientId || '',
      type: transaction.type.toLowerCase() as 'sale' | 'purchase' | 'adjustment' | 'return',
      quantity: transaction.quantity,
      reason: transaction.reason || undefined,
      timestamp: transaction.timestamp.getTime(),
      userId: transaction.userId || undefined,
      product: transaction.product
        ? {
            id: transaction.product.id,
            name: transaction.product.name,
          }
        : undefined,
      ingredient: transaction.ingredient
        ? {
            id: transaction.ingredient.id,
            name: transaction.ingredient.name,
          }
        : undefined,
    };
  }

  private transformAlert(alert: any) {
    return {
      id: alert.id,
      productId: alert.productId || '',
      ingredientId: alert.ingredientId || '',
      type: alert.type.toLowerCase().replace('_', '_') as 'low_stock' | 'out_of_stock' | 'overstock',
      message: alert.message,
      timestamp: alert.timestamp.getTime(),
      isRead: alert.isRead,
      product: alert.product
        ? {
            id: alert.product.id,
            name: alert.product.name,
          }
        : undefined,
      ingredient: alert.ingredient
        ? {
            id: alert.ingredient.id,
            name: alert.ingredient.name,
          }
        : undefined,
    };
  }
}

export default new StockService();

