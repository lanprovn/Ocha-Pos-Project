import prisma from '../config/database';
import {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  ReceivePurchaseOrderInput,
  PurchaseOrderStatus,
} from '../types/supplier.types';
import { PurchaseOrderNotFoundError, InvalidPurchaseOrderStatusError, SupplierNotFoundError } from '../errors/BusinessErrors';
import { Decimal } from '@prisma/client/runtime/library';
import { StockTransactionType } from '../types/common.types';
import logger from '../utils/logger';
import { emitStockUpdated } from '../socket/socket.io';

export class PurchaseOrderService {
  /**
   * Generate unique purchase order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${timestamp}-${random}`;
  }

  /**
   * Get all purchase orders with optional filters
   */
  async getAll(filters?: {
    supplierId?: string;
    status?: PurchaseOrderStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.supplierId) {
      where.supplierId = filters.supplierId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            ingredient: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return purchaseOrders;
  }

  /**
   * Get purchase order by ID
   */
  async getById(id: string) {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            ingredient: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new PurchaseOrderNotFoundError(id);
    }

    return purchaseOrder;
  }

  /**
   * Create a new purchase order
   */
  async create(data: CreatePurchaseOrderInput) {
    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier) {
      throw new SupplierNotFoundError(data.supplierId);
    }

    // Calculate total amount
    const totalAmount = data.items.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);

    // Create purchase order with items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        supplierId: data.supplierId,
        status: PurchaseOrderStatus.DRAFT,
        totalAmount: new Decimal(totalAmount),
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            ingredientId: item.ingredientId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
            subtotal: new Decimal(item.unitPrice * item.quantity),
            notes: item.notes,
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            ingredient: true,
          },
        },
      },
    });

    return purchaseOrder;
  }

  /**
   * Update purchase order
   */
  async update(id: string, data: UpdatePurchaseOrderInput) {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new PurchaseOrderNotFoundError(id);
    }

    // Cannot update if already received or paid
    if (purchaseOrder.status === PurchaseOrderStatus.RECEIVED || purchaseOrder.status === PurchaseOrderStatus.PAID) {
      throw new InvalidPurchaseOrderStatusError(
        'Không thể cập nhật đơn nhập hàng đã nhận hoặc đã thanh toán',
        { orderId: id, currentStatus: purchaseOrder.status }
      );
    }

    const updateData: any = {};

    if (data.supplierId) {
      // Verify supplier exists
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });

      if (!supplier) {
        throw new SupplierNotFoundError(data.supplierId);
      }

      updateData.supplierId = data.supplierId;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.status) {
      updateData.status = data.status;
    }

    // Update items if provided
    if (data.items && data.items.length > 0) {
      // Delete existing items
      await prisma.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });

      // Calculate new total amount
      const totalAmount = data.items.reduce((sum, item) => {
        return sum + item.unitPrice * item.quantity;
      }, 0);

      updateData.totalAmount = new Decimal(totalAmount);

      // Create new items
      await prisma.purchaseOrderItem.createMany({
        data: data.items.map((item) => ({
          purchaseOrderId: id,
          productId: item.productId,
          ingredientId: item.ingredientId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: new Decimal(item.unitPrice),
          subtotal: new Decimal(item.unitPrice * item.quantity),
          notes: item.notes,
        })),
      });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            ingredient: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Receive purchase order and update stock
   */
  async receive(id: string, data: ReceivePurchaseOrderInput) {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!purchaseOrder) {
      throw new PurchaseOrderNotFoundError(id);
    }

    // Can only receive if status is DRAFT or SENT
    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT && purchaseOrder.status !== PurchaseOrderStatus.SENT) {
      throw new InvalidPurchaseOrderStatusError(
        `Không thể nhận hàng với trạng thái hiện tại: ${purchaseOrder.status}`,
        { orderId: id, currentStatus: purchaseOrder.status }
      );
    }

    // Update stock for each item
    for (const item of purchaseOrder.items) {
      try {
        if (item.productId) {
          // Update product stock
          const stock = await prisma.stock.findUnique({
            where: { productId: item.productId },
          });

          if (stock) {
            await prisma.stock.update({
              where: { id: stock.id },
              data: {
                quantity: { increment: item.quantity },
                lastUpdated: new Date(),
              },
            });

            // Create stock transaction
            await prisma.stockTransaction.create({
              data: {
                productId: item.productId,
                type: StockTransactionType.PURCHASE,
                quantity: item.quantity,
                reason: `Nhập hàng từ đơn nhập ${purchaseOrder.orderNumber}`,
              },
            });

            // Emit socket event
            const updatedStock = await prisma.stock.findUnique({
              where: { id: stock.id },
            });

            if (updatedStock) {
              emitStockUpdated({
                type: 'product',
                productId: item.productId,
                stockId: updatedStock.id,
                oldQuantity: stock.quantity,
                newQuantity: updatedStock.quantity,
              });
            }
          } else {
            logger.warn(`Stock not found for product ${item.productId}`);
          }
        } else if (item.ingredientId) {
          // Update ingredient stock
          const ingredientStock = await prisma.ingredientStock.findUnique({
            where: { ingredientId: item.ingredientId },
          });

          if (ingredientStock) {
            await prisma.ingredientStock.update({
              where: { id: ingredientStock.id },
              data: {
                quantity: { increment: item.quantity },
                lastUpdated: new Date(),
              },
            });

            // Create stock transaction
            await prisma.stockTransaction.create({
              data: {
                ingredientId: item.ingredientId,
                type: StockTransactionType.PURCHASE,
                quantity: item.quantity,
                reason: `Nhập hàng từ đơn nhập ${purchaseOrder.orderNumber}`,
              },
            });

            // Emit socket event
            const updatedStock = await prisma.ingredientStock.findUnique({
              where: { id: ingredientStock.id },
            });

            if (updatedStock) {
              emitStockUpdated({
                type: 'ingredient',
                ingredientId: item.ingredientId,
                stockId: updatedStock.id,
                oldQuantity: ingredientStock.quantity,
                newQuantity: updatedStock.quantity,
              });
            }
          } else {
            logger.warn(`Stock not found for ingredient ${item.ingredientId}`);
          }
        }
      } catch (error: any) {
        logger.error(`Error updating stock for purchase order item ${item.id}`, {
          error: error.message,
          itemId: item.id,
        });
      }
    }

    // Update purchase order status
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.RECEIVED,
        receivedAt: data.receivedAt || new Date(),
        notes: data.notes ? `${purchaseOrder.notes || ''}\n${data.notes}`.trim() : purchaseOrder.notes,
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            ingredient: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Mark purchase order as paid
   */
  async markAsPaid(id: string) {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new PurchaseOrderNotFoundError(id);
    }

    if (purchaseOrder.status !== PurchaseOrderStatus.RECEIVED) {
      throw new InvalidPurchaseOrderStatusError(
        'Chỉ có thể thanh toán đơn nhập hàng đã nhận',
        { orderId: id, currentStatus: purchaseOrder.status }
      );
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.PAID,
        paidAt: new Date(),
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            ingredient: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Cancel purchase order
   */
  async cancel(id: string) {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder) {
      throw new PurchaseOrderNotFoundError(id);
    }

    // Cannot cancel if already received or paid
    if (purchaseOrder.status === PurchaseOrderStatus.RECEIVED || purchaseOrder.status === PurchaseOrderStatus.PAID) {
      throw new InvalidPurchaseOrderStatusError(
        'Không thể hủy đơn nhập hàng đã nhận hoặc đã thanh toán',
        { orderId: id, currentStatus: purchaseOrder.status }
      );
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.CANCELLED,
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            ingredient: true,
          },
        },
      },
    });

    return updated;
  }
}

export default new PurchaseOrderService();



