import { Request, Response } from 'express';
import productService from '../services/product.service';
import { transformProduct } from '../utils/transform';
import { z } from 'zod';
import { BaseController } from './base.controller';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, SUCCESS_MESSAGES, PAGINATION } from '../constants';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';
import { sendPaginated } from '../utils/response';

const createProductSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc.'),
  description: z.string().optional(),
  price: ValidationSchemas.positiveNumber,
  categoryId: ValidationSchemas.uuid.optional(),
  image: z.string().url('URL hình ảnh không hợp lệ.').optional().or(z.literal('')),
  rating: z.number().min(0).max(5, 'Đánh giá phải từ 0 đến 5.').optional(),
  discount: z.number().min(0).max(100, 'Giảm giá phải từ 0 đến 100.').optional(),
  stock: z.number().int().min(0, 'Số lượng không được âm.').optional(),
  isAvailable: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sizes: z
    .array(
      z.object({
        name: z.string().min(1, 'Tên size là bắt buộc.'),
        extraPrice: z.number().min(0, 'Giá thêm không được âm.'),
      })
    )
    .optional(),
  toppings: z
    .array(
      z.object({
        name: z.string().min(1, 'Tên topping là bắt buộc.'),
        extraPrice: z.number().min(0, 'Giá thêm không được âm.'),
      })
    )
    .optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc.').optional(),
  description: z.string().optional(),
  price: ValidationSchemas.positiveNumber.optional(),
  categoryId: ValidationSchemas.uuid.optional(),
  image: z.string().url('URL hình ảnh không hợp lệ.').optional().or(z.literal('')),
  rating: z.number().min(0).max(5, 'Đánh giá phải từ 0 đến 5.').optional(),
  discount: z.number().min(0).max(100, 'Giảm giá phải từ 0 đến 100.').optional(),
  stock: z.number().int().min(0, 'Số lượng không được âm.').optional(),
  isAvailable: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

const idParamSchema = z.object({
  id: ValidationSchemas.uuid,
});

export class ProductController extends BaseController {
  /**
   * Get all products with optional pagination
   */
  getAll = this.asyncHandler(async (req: Request, res: Response) => {
    // Parse pagination params with defaults
    const page = req.query.page 
      ? parseInt(String(req.query.page), 10) 
      : PAGINATION.DEFAULT_PAGE;
    const limit = req.query.limit 
      ? Math.min(parseInt(String(req.query.limit), 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

    // Validate page and limit
    if (isNaN(page) || page < 1) {
      throw new AppError('Page phải là số nguyên dương.', HTTP_STATUS.BAD_REQUEST);
    }
    if (isNaN(limit) || limit < 1) {
      throw new AppError('Limit phải là số nguyên dương.', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await productService.getAll(page, limit);
    
    // Handle paginated response
    if (result && 'data' in result && 'pagination' in result) {
      const transformed = result.data.map(transformProduct);
      sendPaginated(res, transformed, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      });
    } else {
      // Backward compatibility: array response
      const transformed = (result as any[]).map(transformProduct);
      this.success(res, transformed);
    }
  });

  /**
   * Get product by ID
   */
  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const product = await productService.getById(id);
    const transformed = transformProduct(product);
    this.success(res, transformed);
  });

  /**
   * Create new product
   */
  create = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createProductSchema, req.body);
    const product = await productService.create(validated);
    const transformed = transformProduct(product);
    this.created(res, transformed, SUCCESS_MESSAGES.CREATED);
  });

  /**
   * Update product
   */
  update = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(updateProductSchema, req.body);
    const product = await productService.update(id, validated);
    const transformed = transformProduct(product);
    this.success(res, transformed, SUCCESS_MESSAGES.UPDATED);
  });

  /**
   * Delete product
   */
  delete = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    await productService.delete(id);
    this.success(res, { message: 'Xóa sản phẩm thành công.' });
  });
}

// Export instance
const productController = new ProductController();
export default productController;

