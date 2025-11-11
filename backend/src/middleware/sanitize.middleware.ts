import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize string inputs to prevent XSS attacks
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Remove potentially dangerous characters
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
}

/**
 * Recursively sanitize object values
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware to sanitize request body, query, and params
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as any;
  }

  // Sanitize params (usually UUIDs or IDs, but sanitize anyway)
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as any;
  }

  next();
}

