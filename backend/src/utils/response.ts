/**
 * Response Helpers
 * Standardized API response format for consistency
 */

import { Response } from 'express';
import { HTTP_STATUS } from '../constants';

/**
 * Standard API Response Structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    statusCode,
  };
  res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: any
): void {
  const response: ApiResponse = {
    success: false,
    error,
    statusCode,
  };
  
  // Add details in development mode
  if (process.env.NODE_ENV === 'development' && details) {
    (response as any).details = details;
  }
  
  res.status(statusCode).json(response);
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): void {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    message,
    statusCode: HTTP_STATUS.OK,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    },
  };
  
  res.status(HTTP_STATUS.OK).json(response);
}

/**
 * Send created response
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message?: string
): void {
  sendSuccess(res, data, message, HTTP_STATUS.CREATED);
}

/**
 * Send no content response
 */
export function sendNoContent(res: Response): void {
  res.status(HTTP_STATUS.NO_CONTENT).send();
}

