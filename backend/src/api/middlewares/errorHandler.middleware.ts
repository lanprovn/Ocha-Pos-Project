import { Request, Response, NextFunction } from 'express';
import { AppError } from '@core/errors/AppError';
import { ZodError } from 'zod';
import logger from '@utils/logger';

/**
 * Error handler middleware
 * Handles all errors and returns appropriate responses
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error với context
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Handle AppError (business errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.serialize());
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      errorCode: 'VALIDATION_ERROR',
      details: err.errors,
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError' || err.name === 'PrismaClientInitializationError') {
    const prismaError = err as any;
    
    // Table does not exist
    if (err.message && err.message.includes('does not exist in the current database')) {
      logger.error('Database table missing - migrations may not have run', {
        error: err.message,
        path: req.path,
      });
      return res.status(500).json({
        error: 'Database tables not found. Please run migrations.',
        errorCode: 'DATABASE_NOT_INITIALIZED',
        message: err.message,
      });
    }
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        error: 'Dữ liệu đã tồn tại',
        errorCode: 'DUPLICATE_ENTRY',
        details: {
          field: prismaError.meta?.target,
        },
      });
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: 'Không tìm thấy dữ liệu',
        errorCode: 'NOT_FOUND',
      });
    }
  }

  // Handle unknown errors
  // Always log full error details for debugging
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    error: 'Internal server error',
    errorCode: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production' ? { 
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    } : {}),
  });
}

