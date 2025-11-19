import prisma from '../config/database';
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
import { emitStockUpdated, emitStockAlert } from '../socket/socket.io';

export class StockService {
  // ========== Product Stock ==========

  async getAllProductStocks() {
    const stocks = await prisma.stock.findMany({
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

    return stocks.map((stock) => this.transformProductStock(stock));
  }

  async getProductStockById(id: string) {
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!stock) {
      throw new Error('Product stock not found');
    }

    return this.transformProductStock(stock);
  }

  async updateProductStock(id: string, data: UpdateStockProductInput) {
    const stock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      throw new Error('Product stock not found');
    }

    const updateData: any = {};
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.minStock !== undefined) updateData.minStock = data.minStock;
    if (data.maxStock !== undefined) updateData.maxStock = data.maxStock;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    updateData.lastUpdated = new Date();

    const updated = await prisma.stock.update({
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

    return this.transformProductStock(updated);
  }

  async createProductStock(data: CreateProductStockInput) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { category: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const existing = await prisma.stock.findUnique({
      where: { productId: data.productId },
    });

    if (existing) {
      throw new Error('Stock already exists for this product');
    }

    const stock = await prisma.stock.create({
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

    return this.transformProductStock(stock);
  }

  async deleteProductStock(id: string) {
    const stock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      throw new Error('Product stock not found');
    }

    await prisma.stock.delete({
      where: { id },
    });

    return { message: 'Product stock deleted successfully' };
  }

  // ========== Ingredient Stock ==========

  async getAllIngredientStocks() {
    const stocks = await prisma.ingredientStock.findMany({
      include: {
        ingredient: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    return stocks.map((stock) => this.transformIngredientStock(stock));
  }

  async getIngredientStockById(id: string) {
    const stock = await prisma.ingredientStock.findUnique({
      where: { id },
      include: {
        ingredient: true,
      },
    });

    if (!stock) {
      throw new Error('Ingredient stock not found');
    }

    return this.transformIngredientStock(stock);
  }

  async updateIngredientStock(id: string, data: UpdateStockIngredientInput) {
    const stock = await prisma.ingredientStock.findUnique({
      where: { id },
      include: {
        ingredient: true,
      },
    });

    if (!stock) {
      throw new Error('Ingredient stock not found');
    }

    const updateData: any = {};
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.minStock !== undefined) updateData.minStock = data.minStock;
    if (data.maxStock !== undefined) updateData.maxStock = data.maxStock;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    updateData.lastUpdated = new Date();

    let updated = await prisma.ingredientStock.update({
      where: { id },
      data: updateData,
      include: {
        ingredient: true,
      },
    });

    if ((data.name !== undefined || data.unit !== undefined) && stock.ingredient) {
      await prisma.ingredient.update({
        where: { id: stock.ingredientId },
        data: {
          name: data.name !== undefined ? data.name : stock.ingredient.name,
          unit: data.unit !== undefined ? data.unit : stock.ingredient.unit,
        },
      });

      updated = await prisma.ingredientStock.findUnique({
        where: { id },
        include: {
          ingredient: true,
        },
      }) as any;
    }

    return this.transformIngredientStock(updated);
  }

  async createIngredient(data: CreateIngredientInput) {
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
      throw new Error('Ingredient not found');
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
      throw new Error('Ingredient stock not found');
    }

    return this.transformIngredientStock(updated);
  }

  async deleteIngredient(id: string) {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
    });

    if (!ingredient) {
      throw new Error('Ingredient not found');
    }

    await prisma.ingredient.delete({
      where: { id },
    });

    return { message: 'Ingredient deleted successfully' };
  }

  // ========== Stock Transactions ==========

  async createTransaction(data: CreateStockTransactionInput) {
    const transaction = await prisma.stockTransaction.create({
      data: {
        productId: data.productId || null,
        ingredientId: data.ingredientId || null,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason || null,
        userId: data.userId || null,
      },
      include: {
        product: true,
        ingredient: true,
      },
    });

    // Update stock quantity if productId or ingredientId provided
    if (data.productId) {
      await this.updateProductStockFromTransaction(data.productId, data.type, data.quantity);
    } else if (data.ingredientId) {
      await this.updateIngredientStockFromTransaction(data.ingredientId, data.type, data.quantity);
    }

    return this.transformTransaction(transaction);
  }

  async getAllTransactions(filters?: StockFilters) {
    const where: any = {};

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.ingredientId) {
      where.ingredientId = filters.ingredientId;
    }

    const transactions = await prisma.stockTransaction.findMany({
      where,
      include: {
        product: true,
        ingredient: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return transactions.map((t) => this.transformTransaction(t));
  }

  async getTransactionById(id: string) {
    const transaction = await prisma.stockTransaction.findUnique({
      where: { id },
      include: {
        product: true,
        ingredient: true,
      },
    });

    if (!transaction) {
      throw new Error('Stock transaction not found');
    }

    return this.transformTransaction(transaction);
  }

  // ========== Stock Alerts ==========

  async createAlert(data: CreateStockAlertInput) {
    const alert = await prisma.stockAlert.create({
      data: {
        productId: data.productId || null,
        ingredientId: data.ingredientId || null,
        type: data.type,
        message: data.message,
        isRead: false,
      },
      include: {
        product: true,
        ingredient: true,
      },
    });

    return this.transformAlert(alert);
  }

  async getAllAlerts(filters?: StockFilters) {
    const where: any = {};

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.ingredientId) {
      where.ingredientId = filters.ingredientId;
    }

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    const alerts = await prisma.stockAlert.findMany({
      where,
      include: {
        product: true,
        ingredient: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return alerts.map((a) => this.transformAlert(a));
  }

  async getAlertById(id: string) {
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
      include: {
        product: true,
        ingredient: true,
      },
    });

    if (!alert) {
      throw new Error('Stock alert not found');
    }

    return this.transformAlert(alert);
  }

  async updateAlert(id: string, data: UpdateStockAlertInput) {
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new Error('Stock alert not found');
    }

    const updated = await prisma.stockAlert.update({
      where: { id },
      data: {
        isRead: data.isRead !== undefined ? data.isRead : alert.isRead,
        message: data.message !== undefined ? data.message : alert.message,
      },
      include: {
        product: true,
        ingredient: true,
      },
    });

    return this.transformAlert(updated);
  }

  async markAlertAsRead(id: string) {
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new Error('Stock alert not found');
    }

    const updated = await prisma.stockAlert.update({
      where: { id },
      data: {
        isRead: true,
      },
      include: {
        product: true,
        ingredient: true,
      },
    });

    return this.transformAlert(updated);
  }

  async deleteAlert(id: string) {
    const alert = await prisma.stockAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new Error('Stock alert not found');
    }

    await prisma.stockAlert.delete({
      where: { id },
    });

    return { message: 'Stock alert deleted successfully' };
  }

  // ========== Helper Methods ==========

  private async updateProductStockFromTransaction(
    productId: string,
    type: string,
    quantity: number
  ) {
    const stock = await prisma.stock.findUnique({
      where: { productId },
      include: {
        product: true,
      },
    });

    if (!stock) return;

    const oldQuantity = stock.quantity;
    let newQuantity = oldQuantity;
    if (type === 'SALE') {
      newQuantity -= quantity;
    } else if (type === 'PURCHASE' || type === 'ADJUSTMENT') {
      newQuantity += quantity;
    } else if (type === 'RETURN') {
      newQuantity += quantity;
    }

    const updatedStock = await prisma.stock.update({
      where: { id: stock.id },
      data: {
        quantity: Math.max(0, newQuantity),
        lastUpdated: new Date(),
      },
      include: {
        product: true,
      },
    });

    // Emit socket.io event for real-time updates
    emitStockUpdated({
      type: 'product',
      productId: productId,
      stockId: updatedStock.id,
      oldQuantity: oldQuantity,
      newQuantity: updatedStock.quantity,
    });

    // Check and create alert if stock is low
    await this.checkAndCreateStockAlert({
      type: 'product',
      stockId: updatedStock.id,
      productId: productId,
      currentQuantity: updatedStock.quantity,
      minStock: updatedStock.minStock,
      productName: updatedStock.product?.name,
    });
  }

  private async updateIngredientStockFromTransaction(
    ingredientId: string,
    type: string,
    quantity: number
  ) {
    const stock = await prisma.ingredientStock.findUnique({
      where: { ingredientId },
      include: {
        ingredient: true,
      },
    });

    if (!stock) return;

    const oldQuantity = stock.quantity;
    let newQuantity = oldQuantity;
    if (type === 'SALE') {
      newQuantity -= quantity;
    } else if (type === 'PURCHASE' || type === 'ADJUSTMENT') {
      newQuantity += quantity;
    } else if (type === 'RETURN') {
      newQuantity += quantity;
    }

    const updatedStock = await prisma.ingredientStock.update({
      where: { id: stock.id },
      data: {
        quantity: Math.max(0, newQuantity),
        lastUpdated: new Date(),
      },
      include: {
        ingredient: true,
      },
    });

    // Emit socket.io event for real-time updates
    emitStockUpdated({
      type: 'ingredient',
      ingredientId: ingredientId,
      stockId: updatedStock.id,
      oldQuantity: oldQuantity,
      newQuantity: updatedStock.quantity,
    });

    // Check and create alert if stock is low
    await this.checkAndCreateStockAlert({
      type: 'ingredient',
      stockId: updatedStock.id,
      ingredientId: ingredientId,
      currentQuantity: updatedStock.quantity,
      minStock: updatedStock.minStock,
      ingredientName: updatedStock.ingredient?.name,
    });
  }

  private transformProductStock(stock: any) {
    return {
      id: stock.id,
      productId: stock.productId,
      currentStock: stock.quantity,
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
      unit: stock.unit || stock.ingredient?.unit || 'pcs',
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

  /**
   * Check stock level and create alert if needed
   */
  private async checkAndCreateStockAlert(data: {
    type: 'product' | 'ingredient';
    stockId: string;
    productId?: string;
    ingredientId?: string;
    currentQuantity: number;
    minStock: number;
    productName?: string;
    ingredientName?: string;
  }): Promise<void> {
    try {
      // Only create alert if stock is at or below minStock
      if (data.currentQuantity <= data.minStock) {
        const alertType = data.currentQuantity === 0 
          ? 'OUT_OF_STOCK' 
          : 'LOW_STOCK';
        
        const itemName = data.productName || data.ingredientName || 'Sản phẩm';
        const itemType = data.type === 'product' ? 'sản phẩm' : 'nguyên liệu';
        
        const message = data.currentQuantity === 0
          ? `${itemName} đã hết hàng! Vui lòng nhập hàng ngay.`
          : `${itemName} còn ${data.currentQuantity} ${itemType}, dưới mức tối thiểu ${data.minStock}. Vui lòng kiểm tra và nhập hàng.`;
        
        // Check if alert already exists (to avoid duplicates)
        const existingAlert = await prisma.stockAlert.findFirst({
          where: {
            productId: data.productId || null,
            ingredientId: data.ingredientId || null,
            type: alertType,
            isRead: false,
          },
        });

        // Only create new alert if one doesn't exist
        if (!existingAlert) {
          const alert = await this.createAlert({
            productId: data.productId || null,
            ingredientId: data.ingredientId || null,
            type: alertType,
            message: message,
          });

          // Emit socket.io event for real-time alert notification
          emitStockAlert(alert);
        }
      }
    } catch (error) {
      // Don't throw error to avoid blocking stock update
      console.error('Error creating stock alert:', error);
    }
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

