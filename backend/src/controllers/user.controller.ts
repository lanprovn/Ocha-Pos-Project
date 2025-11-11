import { Request, Response } from 'express';
import userService from '../services/user.service';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/errorHandler';

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['ADMIN', 'STAFF']).optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').optional(),
    name: z.string().min(1, 'Name is required').optional(),
    role: z.enum(['ADMIN', 'STAFF']).optional(),
    isActive: z.boolean().optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export class UserController {
  async getAll(_req: AuthRequest, res: Response) {
    try {
      const users = await userService.getAll();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const validated = createUserSchema.parse({ body: req.body });
      const user = await userService.create(validated.body);
      res.status(201).json(user);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(400).json({ error: error.message || 'Failed to create user' });
      }
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateUserSchema.parse({ body: req.body });
      const user = await userService.update(id, validated.body);
      res.json(user);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(400).json({ error: error.message || 'Failed to update user' });
      }
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (req.user && req.user.userId === id) {
        throw new AppError('Cannot delete your own account', 400);
      }

      const result = await userService.delete(id);
      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message || 'Failed to delete user' });
      }
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      // Users can only change their own password
      if (req.user.userId !== id) {
        res.status(403).json({ error: 'Forbidden: You can only change your own password' });
        return;
      }

      const validated = changePasswordSchema.parse({ body: req.body });
      const result = await userService.changePassword(id, validated.body);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(400).json({ error: error.message || 'Failed to change password' });
      }
    }
  }

  async resetPassword(req: AuthRequest, res: Response) {
    try {
      const validated = resetPasswordSchema.parse({ body: req.body });
      const result = await userService.resetPassword(validated.body);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(400).json({ error: error.message || 'Failed to reset password' });
      }
    }
  }
}

export default new UserController();

