import { Request, Response, NextFunction } from 'express';
import userService, { CreateUserInput, UpdateUserInput, UserFilters } from '../services/user.service';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['ADMIN', 'STAFF']),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    name: z.string().min(1).optional(),
    role: z.enum(['ADMIN', 'STAFF']).optional(),
    isActive: z.boolean().optional(),
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
   * Get all users (staff) with filters
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: UserFilters = {
        search: req.query.search as string,
        role: req.query.role as any,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await userService.getAll(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      res.json(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: error.message, errorCode: 'USER_NOT_FOUND' });
        return;
      }
      next(error);
    }
  }

  /**
   * Create new user (staff/admin)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createUserSchema.parse({ body: req.body });
      const user = await userService.create(validated.body as CreateUserInput);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          errorCode: 'VALIDATION_ERROR',
          details: error.errors,
        });
        return;
      }
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message, errorCode: 'DUPLICATE_ERROR' });
        return;
      }
      next(error);
    }
  }

  /**
   * Update user
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateUserSchema.parse({ body: req.body });
      const user = await userService.update(req.params.id, validated.body as UpdateUserInput);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          errorCode: 'VALIDATION_ERROR',
          details: error.errors,
        });
        return;
      }
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: error.message, errorCode: 'USER_NOT_FOUND' });
        return;
      }
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message, errorCode: 'DUPLICATE_ERROR' });
        return;
      }
      next(error);
    }
  }

  /**
   * Delete user (soft delete)
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Prevent deleting yourself
      if (req.user && req.user.userId === req.params.id) {
        res.status(400).json({ error: 'Cannot delete your own account', errorCode: 'CANNOT_DELETE_SELF' });
        return;
      }

      const result = await userService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: error.message, errorCode: 'USER_NOT_FOUND' });
        return;
      }
      next(error);
    }
  }

  /**
   * Get user statistics
   */
  async getStatistics(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getStatistics();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

