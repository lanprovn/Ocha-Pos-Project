import { Request, Response } from 'express';
import { z } from 'zod';
import stockService from '../services/stock.service';
import { BaseController } from './base.controller';
import { SUCCESS_MESSAGES } from '../constants';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';
import { StockFilters } from '../types/stock.types';

// ===== Schemas =====
const createProductStockSchema = z.object({
  productId: ValidationSchemas.uuid,
  quantity: z.number().int().min(0, 'Số lượng không được âm.').optional(),
  minStock: z.number().int().min(0, 'Tồn kho tối thiểu không được âm.').optional(),
  maxStock: z.number().int().min(0, 'Tồn kho tối đa không được âm.').optional(),
  unit: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateProductStockSchema = z.object({
  quantity: z.number().int().min(0, 'Số lượng không được âm.').optional(),
  minStock: z.number().int().min(0, 'Tồn kho tối thiểu không được âm.').optional(),
  maxStock: z.number().int().min(0, 'Tồn kho tối đa không được âm.').optional(),
  unit: z.string().optional(),
  isActive: z.boolean().optional(),
});

const createIngredientSchema = z.object({
  name: z.string().min(1, 'Tên nguyên liệu là bắt buộc.'),
  unit: z.string().min(1, 'Đơn vị là bắt buộc.'),
  quantity: z.number().int().min(0, 'Số lượng không được âm.').optional(),
  minStock: z.number().int().min(0, 'Tồn kho tối thiểu không được âm.').optional(),
  maxStock: z.number().int().min(0, 'Tồn kho tối đa không được âm.').optional(),
  isActive: z.boolean().optional(),
});

const updateIngredientStockSchema = z.object({
  quantity: z.number().int().min(0, 'Số lượng không được âm.').optional(),
  minStock: z.number().int().min(0, 'Tồn kho tối thiểu không được âm.').optional(),
  maxStock: z.number().int().min(0, 'Tồn kho tối đa không được âm.').optional(),
  isActive: z.boolean().optional(),
});

const createTransactionSchema = z.object({
  productId: ValidationSchemas.uuid.optional().nullable(),
  ingredientId: ValidationSchemas.uuid.optional().nullable(),
  type: z.enum(['SALE', 'PURCHASE', 'ADJUSTMENT', 'RETURN']),
  quantity: z.number().int(),
  reason: z.string().optional().nullable(),
  userId: ValidationSchemas.uuid.optional().nullable(),
});

const createAlertSchema = z.object({
  productId: ValidationSchemas.uuid.optional().nullable(),
  ingredientId: ValidationSchemas.uuid.optional().nullable(),
  type: z.enum(['LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK']),
  message: z.string().min(1, 'Thông báo là bắt buộc.'),
});

const updateAlertSchema = z.object({
  isRead: z.boolean().optional(),
  message: z.string().optional(),
});

const idParamSchema = z.object({
  id: ValidationSchemas.uuid,
});

const transactionFiltersSchema = z.object({
  productId: ValidationSchemas.uuid.optional(),
  ingredientId: ValidationSchemas.uuid.optional(),
});

const alertFiltersSchema = z.object({
  productId: ValidationSchemas.uuid.optional(),
  ingredientId: ValidationSchemas.uuid.optional(),
  isRead: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    },
    z.boolean().optional()
  ).optional(),
});

// ========== Product Stock ==========

export class StockController extends BaseController {
  /**
   * Get all product stocks
   */
  getAllProductStocks = this.asyncHandler(async (_req: Request, res: Response) => {
    const stocks = await stockService.getAllProductStocks();
    this.success(res, stocks);
  });

  /**
   * Get product stock by ID
   */
  getProductStockById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const stock = await stockService.getProductStockById(id);
    this.success(res, stock);
  });

  /**
   * Update product stock
   */
  updateProductStock = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(updateProductStockSchema, req.body);
    const stock = await stockService.updateProductStock(id, validated);
    this.success(res, stock, SUCCESS_MESSAGES.UPDATED);
  });

  /**
   * Create product stock
   */
  createProductStock = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createProductStockSchema, req.body);
    const stock = await stockService.createProductStock(validated);
    this.created(res, stock, SUCCESS_MESSAGES.CREATED);
  });

  /**
   * Delete product stock
   */
  deleteProductStock = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    await stockService.deleteProductStock(id);
    this.success(res, { message: 'Xóa tồn kho sản phẩm thành công.' });
  });

  // ========== Ingredient Stock ==========

  /**
   * Get all ingredient stocks
   */
  getAllIngredientStocks = this.asyncHandler(async (_req: Request, res: Response) => {
    const stocks = await stockService.getAllIngredientStocks();
    this.success(res, stocks);
  });

  /**
   * Get ingredient stock by ID
   */
  getIngredientStockById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const stock = await stockService.getIngredientStockById(id);
    this.success(res, stock);
  });

  /**
   * Update ingredient stock
   */
  updateIngredientStock = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(updateIngredientStockSchema, req.body);
    const stock = await stockService.updateIngredientStock(id, validated);
    this.success(res, stock, SUCCESS_MESSAGES.UPDATED);
  });

  /**
   * Create ingredient
   */
  createIngredient = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createIngredientSchema, req.body);
    const ingredient = await stockService.createIngredient(validated);
    this.created(res, ingredient, SUCCESS_MESSAGES.CREATED);
  });

  /**
   * Delete ingredient
   */
  deleteIngredient = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    await stockService.deleteIngredient(id);
    this.success(res, { message: 'Xóa nguyên liệu thành công.' });
  });

  // ========== Transactions ==========

  /**
   * Create stock transaction
   */
  createTransaction = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createTransactionSchema, req.body);
    const transaction = await stockService.createTransaction(validated);
    this.created(res, transaction, SUCCESS_MESSAGES.CREATED);
  });

  /**
   * Get all transactions
   */
  getAllTransactions = this.asyncHandler(async (req: Request, res: Response) => {
    const filters = validateOrThrow(transactionFiltersSchema, req.query);
    const transactions = await stockService.getAllTransactions(filters);
    this.success(res, transactions);
  });

  /**
   * Get transaction by ID
   */
  getTransactionById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const transaction = await stockService.getTransactionById(id);
    this.success(res, transaction);
  });

  // ========== Alerts ==========

  /**
   * Create stock alert
   */
  createAlert = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createAlertSchema, req.body);
    const alert = await stockService.createAlert(validated);
    this.created(res, alert, SUCCESS_MESSAGES.CREATED);
  });

  /**
   * Get all alerts
   */
  getAllAlerts = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(alertFiltersSchema, req.query);
    const filters: StockFilters = {
      productId: validated.productId,
      ingredientId: validated.ingredientId,
      isRead: typeof validated.isRead === 'boolean' ? validated.isRead : undefined,
    };
    const alerts = await stockService.getAllAlerts(filters);
    this.success(res, alerts);
  });

  /**
   * Get alert by ID
   */
  getAlertById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const alert = await stockService.getAlertById(id);
    this.success(res, alert);
  });

  /**
   * Update alert
   */
  updateAlert = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(updateAlertSchema, req.body);
    const alert = await stockService.updateAlert(id, validated);
    this.success(res, alert, SUCCESS_MESSAGES.UPDATED);
  });

  /**
   * Mark alert as read
   */
  markAlertAsRead = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const alert = await stockService.markAlertAsRead(id);
    this.success(res, alert, SUCCESS_MESSAGES.UPDATED);
  });

  /**
   * Delete alert
   */
  deleteAlert = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    await stockService.deleteAlert(id);
    this.success(res, { message: 'Xóa cảnh báo thành công.' });
  });
}

// Export instance
const stockController = new StockController();
export default stockController;
