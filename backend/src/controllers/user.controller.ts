import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
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
}

export default new UserController();

