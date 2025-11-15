/**
 * Validation Utilities
 * Common validation functions and helpers
 */

import { z } from 'zod';
import { ERROR_MESSAGES } from '../constants';

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  // UUID validation
  uuid: z.string().uuid({ message: ERROR_MESSAGES.INVALID_FORMAT }),
  
  // Email validation
  email: z.string().email({ message: 'Email không hợp lệ.' }),
  
  // Password validation (min 6 characters)
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' }),
  
  // Positive number
  positiveNumber: z.number().positive({ message: 'Số phải lớn hơn 0.' }),
  
  // Non-negative number
  nonNegativeNumber: z.number().nonnegative({ message: 'Số không được âm.' }),
  
  // Pagination
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }),
  
  // Date string (YYYY-MM-DD)
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Định dạng ngày không hợp lệ. Sử dụng định dạng YYYY-MM-DD.',
  }),
} as const;

/**
 * Validate and parse data with Zod schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

/**
 * Validate and throw if invalid
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

