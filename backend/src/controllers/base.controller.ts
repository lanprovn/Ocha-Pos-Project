/**
 * Base Controller
 * Provides common functionality for all controllers
 */

import { Response } from 'express';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { handleError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export class BaseController {
  /**
   * Send success response
   */
  protected success<T>(res: Response, data: T, message?: string, statusCode: number = HTTP_STATUS.OK): void {
    sendSuccess(res, data, message, statusCode);
  }

  /**
   * Send created response
   */
  protected created<T>(res: Response, data: T, message?: string): void {
    sendCreated(res, data, message);
  }

  /**
   * Send error response
   */
  protected error(res: Response, error: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR): void {
    sendError(res, error, statusCode);
  }

  /**
   * Handle async errors
   */
  protected asyncHandler(fn: Function) {
    return async (req: any, res: Response, next: any) => {
      try {
        await fn(req, res, next);
      } catch (error: any) {
        handleError(error, res, req);
      }
    };
  }

  /**
   * Handle not found
   */
  protected notFound(res: Response, message: string = ERROR_MESSAGES.NOT_FOUND): void {
    sendError(res, message, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Handle unauthorized
   */
  protected unauthorized(res: Response, message: string = ERROR_MESSAGES.UNAUTHORIZED): void {
    sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Handle forbidden
   */
  protected forbidden(res: Response, message: string = ERROR_MESSAGES.FORBIDDEN): void {
    sendError(res, message, HTTP_STATUS.FORBIDDEN);
  }
}

