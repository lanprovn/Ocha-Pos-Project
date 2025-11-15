import { Response } from 'express';
import { ZodError } from 'zod';
import logger from './logger';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { sendError } from './response';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Map Zod errors to user-friendly messages
 */
function mapZodErrors(zodError: ZodError): string[] {
  return zodError.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(error: any): string {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }
  
  // Handle AppError
  if (error instanceof AppError) {
    return error.message;
  }
  
  const errorMessage = error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  
  // Check if we have a custom message for this error
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key) || errorMessage === key) {
      return message;
    }
  }
  
  // Return original message if in development, generic message in production
  if (process.env.NODE_ENV === 'development') {
    return errorMessage;
  }
  
  return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
}

/**
 * Handle errors and send consistent error response
 */
export function handleError(error: any, res: Response, req?: any): void {
  // Determine status code
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let userMessage: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  let details: any = undefined;
  
  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    userMessage = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    userMessage = ERROR_MESSAGES.VALIDATION_ERROR;
    details = mapZodErrors(error);
  } else if (error.statusCode) {
    statusCode = error.statusCode;
    userMessage = getUserFriendlyMessage(error);
  } else {
    userMessage = getUserFriendlyMessage(error);
  }
  
  // Log error
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    statusCode,
    path: req?.path,
    method: req?.method,
    ip: req?.ip,
    userAgent: req?.get('user-agent'),
  });
  
  // Send error response using standardized format
  sendError(res, userMessage, statusCode, details);
}

/**
 * Async error handler wrapper
 */
export function asyncHandler(fn: Function) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

