import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse({ body: req.body });
      const result = await authService.login(validated.body);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(401).json({ error: error.message || 'Login failed' });
      }
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await authService.getMe(req.user.userId);
      res.json(user);
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default new AuthController();

