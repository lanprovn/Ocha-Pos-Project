import { Request, Response } from 'express';
import userService from '../services/user.service';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { BaseController } from './base.controller';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, USER_ROLES } from '../constants';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';

const createUserSchema = z.object({
  email: ValidationSchemas.email,
  password: ValidationSchemas.password,
  name: z.string().min(1, 'Tên là bắt buộc.'),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.STAFF]).optional(),
});

const updateUserSchema = z.object({
  email: ValidationSchemas.email.optional(),
  name: z.string().min(1, 'Tên là bắt buộc.').optional(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.STAFF]).optional(),
  isActive: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc.'),
  newPassword: ValidationSchemas.password,
});

const resetPasswordSchema = z.object({
  email: ValidationSchemas.email,
  newPassword: ValidationSchemas.password,
});

const idParamSchema = z.object({
  id: ValidationSchemas.uuid,
});

export class UserController extends BaseController {
  /**
   * Get all users
   */
  getAll = this.asyncHandler(async (_req: AuthRequest, res: Response) => {
    const users = await userService.getAll();
    this.success(res, users);
  });

  /**
   * Get user by ID
   */
  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const user = await userService.findById(id);
    this.success(res, user);
  });

  /**
   * Create new user
   */
  create = this.asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = validateOrThrow(createUserSchema, req.body);
    const user = await userService.create(validated);
    this.created(res, user, SUCCESS_MESSAGES.CREATED);
  });

  /**
   * Update user
   */
  update = this.asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);
    const validated = validateOrThrow(updateUserSchema, req.body);
    const user = await userService.update(id, validated);
    this.success(res, user, SUCCESS_MESSAGES.UPDATED);
  });

  /**
   * Delete user
   */
  delete = this.asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = validateOrThrow(idParamSchema, req.params);

    // Prevent deleting yourself
    if (req.user && req.user.userId === id) {
      throw new AppError('Không thể xóa tài khoản của chính bạn.', HTTP_STATUS.BAD_REQUEST);
    }

    await userService.delete(id);
    this.success(res, { message: 'Xóa người dùng thành công.' });
  });

  /**
   * Change password
   */
  changePassword = this.asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const { id } = validateOrThrow(idParamSchema, req.params);

    // Users can only change their own password
    if (req.user.userId !== id) {
      throw new AppError('Bạn chỉ có thể đổi mật khẩu của chính mình.', HTTP_STATUS.FORBIDDEN);
    }

    const validated = validateOrThrow(changePasswordSchema, req.body);
    await userService.changePassword(id, validated);
    this.success(res, { message: 'Đổi mật khẩu thành công.' });
  });

  /**
   * Reset password (admin only)
   */
  resetPassword = this.asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = validateOrThrow(resetPasswordSchema, req.body);
    await userService.resetPassword(validated);
    this.success(res, { message: 'Đặt lại mật khẩu thành công.' });
  });
}

// Export instance
const userController = new UserController();
export default userController;

