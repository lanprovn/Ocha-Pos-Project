import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication middleware - verifies JWT token
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token không được cung cấp. Vui lòng đăng nhập.', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }

    const payload = verifyToken(token);
    
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    
    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ 
        success: false,
        error: error.message,
        statusCode: error.statusCode 
      });
      return;
    }
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      success: false,
      error: ERROR_MESSAGES.INVALID_TOKEN,
      statusCode: HTTP_STATUS.UNAUTHORIZED 
    });
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
        statusCode: HTTP_STATUS.UNAUTHORIZED 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ 
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
        statusCode: HTTP_STATUS.FORBIDDEN 
      });
      return;
    }

    next();
  };
}

