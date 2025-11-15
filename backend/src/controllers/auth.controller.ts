import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { BaseController } from './base.controller';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';

const loginSchema = z.object({
  email: ValidationSchemas.email,
  password: z.string().min(1, 'Mật khẩu là bắt buộc.'),
});

export class AuthController extends BaseController {
  /**
   * Login user
   */
  login = this.asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validated = validateOrThrow(loginSchema, req.body);
    
    // Call service
    const result = await authService.login(validated);
    
    // Send success response
    this.success(res, result, 'Đăng nhập thành công.');
  });

  /**
   * Get current user
   */
  getMe = this.asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    const user = await authService.getMe(req.user.userId);
    this.success(res, user);
  });
}

// Export instance
const authController = new AuthController();
export default authController;

