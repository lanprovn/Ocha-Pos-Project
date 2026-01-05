import { Request, Response, NextFunction } from 'express';
import userService from '@services/user.service';
import { z } from 'zod';
import { AuthRequest } from '@api/middlewares/auth.middleware';
import { ForbiddenError } from '@core/errors';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    name: z.string().min(1, 'Tên không được để trống'),
    role: z.enum(['ADMIN', 'STAFF'], {
      errorMap: () => ({ message: 'Vai trò phải là ADMIN hoặc STAFF' }),
    }),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên không được để trống').optional(),
    email: z.string().email('Email không hợp lệ').optional(),
    role: z.enum(['ADMIN', 'STAFF'], {
      errorMap: () => ({ message: 'Vai trò phải là ADMIN hoặc STAFF' }),
    }).optional(),
    isActive: z.boolean().optional(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  }),
});

export class UserController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse({ body: req.body });
      const result = await userService.login(validated.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
        return;
      }

      const user = await userService.findById(req.user.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (Admin only)
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string | undefined;
      const role = req.query.role as string | undefined;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

      const result = await userService.getAll({
        page,
        limit,
        search,
        role,
        isActive,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (Admin only)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user (Admin only)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createUserSchema.parse({ body: req.body });
      const user = await userService.create(validated.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user (Admin only)
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Prevent user from updating their own role or active status
      if (req.user && req.user.userId === id) {
        const validated = updateUserSchema.parse({ body: req.body });
        // Remove role and isActive from update if user is updating themselves
        const { role, isActive, ...allowedFields } = validated.body;
        const user = await userService.update(id, allowedFields);
        res.json(user);
        return;
      }

      const validated = updateUserSchema.parse({ body: req.body });
      const user = await userService.update(id, validated.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (Admin only)
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Prevent user from deleting their own account
      if (req.user && req.user.userId === id) {
        throw new ForbiddenError('Không thể xóa tài khoản của chính bạn');
      }

      const result = await userService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle user active status (Admin only)
   */
  async toggleActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Prevent user from deactivating their own account
      if (req.user && req.user.userId === id) {
        throw new ForbiddenError('Không thể vô hiệu hóa tài khoản của chính bạn');
      }

      const user = await userService.toggleActive(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset user password (Admin only)
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = resetPasswordSchema.parse({ body: req.body });
      const result = await userService.resetPassword(id, validated.body.newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

