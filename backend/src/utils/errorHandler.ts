import { Response } from 'express';
import logger from './logger';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Validation errors
  'Validation error': 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  'ZodError': 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  
  // Authentication errors
  'Unauthorized': 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.',
  'Forbidden': 'Bạn không có quyền thực hiện thao tác này.',
  'Invalid token': 'Token không hợp lệ. Vui lòng đăng nhập lại.',
  
  // Not found errors
  'Not found': 'Không tìm thấy dữ liệu.',
  'Route not found': 'Đường dẫn không tồn tại.',
  
  // Database errors
  'Database error': 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.',
  'Unique constraint': 'Dữ liệu đã tồn tại trong hệ thống.',
  
  // File errors
  'File not found': 'Không tìm thấy file.',
  'File upload error': 'Lỗi khi upload file. Vui lòng thử lại.',
  
  // Payment errors
  'Payment error': 'Lỗi khi xử lý thanh toán. Vui lòng thử lại.',
  'Payment verification failed': 'Xác thực thanh toán thất bại.',
  
  // Generic errors
  'Internal server error': 'Lỗi hệ thống. Vui lòng thử lại sau.',
};

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(error: any): string {
  const errorMessage = error.message || 'Internal server error';
  
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
  
  return ERROR_MESSAGES['Internal server error'] || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
}

/**
 * Handle errors and send consistent error response
 */
export function handleError(error: any, res: Response, req?: any): void {
  // Determine status code
  const statusCode = error.statusCode || error.status || 500;
  
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
  
  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(error);
  
  // Prepare error response
  const errorResponse: any = {
    error: userMessage,
    statusCode,
  };
  
  // Add error details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      message: error.message,
      stack: error.stack,
    };
  }
  
  // Add validation errors if present
  if (error.errors && Array.isArray(error.errors)) {
    errorResponse.validationErrors = error.errors;
  }
  
  res.status(statusCode).json(errorResponse);
}

/**
 * Async error handler wrapper
 */
export function asyncHandler(fn: Function) {
  return (req: any, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

