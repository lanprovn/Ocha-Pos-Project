import { Request, Response } from 'express';
import orderService from '../services/order.service';
import { emitOrderCreated, emitOrderUpdated, emitOrderStatusChanged } from '../socket/socket.io';
import { z } from 'zod';
import { BaseController } from './base.controller';
import { SUCCESS_MESSAGES, ORDER_STATUS, PAGINATION } from '../constants';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';
import { sendPaginated } from '../utils/response';
import { CreateOrderInput } from '../types/order.types';

// ===== Schemas =====
const orderItemSchema = z.object({
  productId: ValidationSchemas.uuid,
  quantity: z.number().int().positive('Số lượng phải là số nguyên dương.'),
  price: ValidationSchemas.positiveNumber,
  subtotal: ValidationSchemas.positiveNumber,
  selectedSize: z.string().optional().nullable(),
  selectedToppings: z.array(z.string()).optional(),
  note: z.string().optional().nullable(),
});

const createOrderSchema = z.object({
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerTable: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  paymentMethod: z.enum(['CASH', 'QR']).optional(),
  paymentStatus: z.enum(['PENDING', 'SUCCESS', 'FAILED']).optional(),
  orderCreator: z.enum(['STAFF', 'CUSTOMER']).optional(),
  orderCreatorName: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Đơn hàng phải có ít nhất một sản phẩm.'),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
  ]),
});

const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

const refundOrderSchema = z.object({
  refundReason: z.string().optional(),
});

const idParamSchema = z.object({
  id: ValidationSchemas.uuid,
});

const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày không hợp lệ. Sử dụng YYYY-MM-DD.'),
});

const orderFiltersSchema = z.object({
  status: z.enum([
    ORDER_STATUS.CREATING,
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
  ]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'QR']).optional(),
  paymentStatus: z.enum(['PENDING', 'SUCCESS', 'FAILED']).optional(),
  page: z.preprocess(
    (val) => (val ? parseInt(String(val), 10) : undefined),
    z.number().int().positive().optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(String(val), 10) : undefined),
    z.number().int().positive().max(PAGINATION.MAX_LIMIT).optional()
  ),
});

const historyFiltersSchema = z.object({
  status: z.enum([
    ORDER_STATUS.CREATING,
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
  ]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'QR']).optional(),
  paymentStatus: z.enum(['PENDING', 'SUCCESS', 'FAILED']).optional(),
  page: z.preprocess(
    (val) => (val ? parseInt(String(val), 10) : undefined),
    z.number().int().positive().optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(String(val), 10) : undefined),
    z.number().int().positive().max(PAGINATION.MAX_LIMIT).optional()
  ),
});

export class OrderController extends BaseController {
  /**
   * Create or update draft order (cart đang tạo)
   */
  createOrUpdateDraft = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createOrderSchema, req.body);
    const orderInput: CreateOrderInput = {
      ...validated,
      paymentStatus: validated.paymentStatus as 'PENDING' | 'SUCCESS' | 'FAILED' | undefined,
    };
    const order = await orderService.createOrUpdateDraft(orderInput);
    
    // Emit Socket.io event for real-time updates
    emitOrderUpdated(order);
    
    this.success(res, order, 'Cập nhật đơn hàng nháp thành công.');
  });

  /**
   * Create new order
   */
  create = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createOrderSchema, req.body);
    const orderInput: CreateOrderInput = {
      ...validated,
      paymentStatus: validated.paymentStatus as 'PENDING' | 'SUCCESS' | 'FAILED' | undefined,
    };
    const order = await orderService.create(orderInput);
    
    // Emit Socket.io event for real-time updates
    emitOrderCreated(order);
    
    this.created(res, order, SUCCESS_MESSAGES.ORDER_CREATED);
  });

  /**
   * Get all orders with filters and pagination
   */
  getAll = this.asyncHandler(async (req: Request, res: Response) => {
    const query = validateOrThrow(orderFiltersSchema, req.query);
    const page = (query.page as number | undefined) ?? PAGINATION.DEFAULT_PAGE;
    const limit = (query.limit as number | undefined) ?? 50; // Default 50 for orders

    const filters: {
      status?: string;
      startDate?: string;
      endDate?: string;
      paymentMethod?: string;
      paymentStatus?: string;
    } = {};
    
    if (query.status) filters.status = query.status;
    if (query.startDate) filters.startDate = query.startDate;
    if (query.endDate) filters.endDate = query.endDate;
    if (query.paymentMethod) filters.paymentMethod = query.paymentMethod;
    if (query.paymentStatus) filters.paymentStatus = query.paymentStatus;

    const result = await orderService.findAll(filters, page, limit);
    
    // Handle paginated response
    if (result && 'data' in result && 'pagination' in result) {
      sendPaginated(res, result.data, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      });
    } else {
      this.success(res, result);
    }
  });

  /**
   * Get today's orders
   */
  getToday = this.asyncHandler(async (_req: Request, res: Response) => {
    const orders = await orderService.findToday();
    this.success(res, orders);
  });

  /**
   * Get orders by date
   */
  getByDate = this.asyncHandler(async (req: Request, res: Response) => {
    const { date } = validateOrThrow(dateParamSchema, req.params);
    const orders = await orderService.findByDate(date);
    this.success(res, orders);
  });

  /**
   * Get order by ID
   */
  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const order = await orderService.findById(id);
    this.success(res, order);
  });

  /**
   * Update order status
   */
  updateStatus = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(updateOrderStatusSchema, req.body);
    const order = await orderService.updateStatus(id, { status: validated.status });
    
    // Emit Socket.io events for real-time updates
    emitOrderUpdated(order);
    emitOrderStatusChanged(order.id, order.status);
    
    this.success(res, order, SUCCESS_MESSAGES.ORDER_UPDATED);
  });

  /**
   * Cancel order
   */
  cancelOrder = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(cancelOrderSchema, req.body || {});
    const order = await orderService.cancelOrder(id, validated.reason);
    
    // Emit Socket.io events
    emitOrderUpdated(order);
    emitOrderStatusChanged(order.id, ORDER_STATUS.CANCELLED);
    
    this.success(res, { order }, SUCCESS_MESSAGES.ORDER_CANCELLED);
  });

  /**
   * Refund order
   */
  refundOrder = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(refundOrderSchema, req.body || {});
    const order = await orderService.refundOrder(id, validated.refundReason);
    
    // Emit Socket.io events
    emitOrderUpdated(order);
    emitOrderStatusChanged(order.id, ORDER_STATUS.CANCELLED);
    
    this.success(res, { order }, 'Hoàn tiền đơn hàng thành công.');
  });

  /**
   * Get order history with pagination
   */
  getHistory = this.asyncHandler(async (req: Request, res: Response) => {
    const query = validateOrThrow(historyFiltersSchema, req.query);
    const page = (query.page as number | undefined) ?? PAGINATION.DEFAULT_PAGE;
    const limit = (query.limit as number | undefined) ?? 20;

    const filters: {
      status?: string;
      startDate?: string;
      endDate?: string;
      paymentMethod?: string;
      paymentStatus?: string;
    } = {};
    
    if (query.status) filters.status = query.status;
    if (query.startDate) filters.startDate = query.startDate;
    if (query.endDate) filters.endDate = query.endDate;
    if (query.paymentMethod) filters.paymentMethod = query.paymentMethod;
    if (query.paymentStatus) filters.paymentStatus = query.paymentStatus;

    const result = await orderService.getHistory(page, limit, filters);
    
    // Handle paginated response
    if (result && 'data' in result && 'pagination' in result) {
      sendPaginated(res, result.data, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      });
    } else {
      this.success(res, result);
    }
  });

  /**
   * Print receipt (return order data formatted for receipt)
   */
  printReceipt = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const order = await orderService.findById(id);

    // Format receipt data
    const receipt = {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customerName: order.customerName || 'Khách vãng lai',
      customerPhone: order.customerPhone || '',
      customerTable: order.customerTable || '',
      items: order.items.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal),
      })),
      subtotal: parseFloat(order.totalAmount),
      total: parseFloat(order.totalAmount),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
    };

    this.success(res, receipt);
  });
}

// Export instance
const orderController = new OrderController();
export default orderController;
