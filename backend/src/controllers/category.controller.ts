import { Request, Response } from 'express';
import categoryService from '../services/category.service';
import { transformCategory } from '../utils/transform';
import { z } from 'zod';
import { BaseController } from './base.controller';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc.'),
  image: z.string().url('URL hình ảnh không hợp lệ.').optional().or(z.literal('')),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc.').optional(),
  image: z.string().url('URL hình ảnh không hợp lệ.').optional().or(z.literal('')),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const idParamSchema = z.object({
  id: ValidationSchemas.uuid,
});

export class CategoryController extends BaseController {
  /**
   * Get all categories
   */
  getAll = this.asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.getAll();
    const transformed = categories.map(transformCategory);
    this.success(res, transformed);
  });

  /**
   * Get category by ID
   */
  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const category = await categoryService.getById(id);
    
    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    const transformed = transformCategory(category);
    this.success(res, transformed);
  });

  /**
   * Create new category
   */
  create = this.asyncHandler(async (req: Request, res: Response) => {
    const validated = validateOrThrow(createCategorySchema, req.body);
    const category = await categoryService.create(validated);
    const transformed = transformCategory(category);
    this.created(res, transformed, SUCCESS_MESSAGES.CREATED);
  });

  /**
   * Update category
   */
  update = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(updateCategorySchema, req.body);
    const category = await categoryService.update(id, validated);
    const transformed = transformCategory(category);
    this.success(res, transformed, SUCCESS_MESSAGES.UPDATED);
  });

  /**
   * Delete category
   */
  delete = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    await categoryService.delete(id);
    this.success(res, { message: 'Xóa danh mục thành công.' });
  });
}

// Export instance
const categoryController = new CategoryController();
export default categoryController;

