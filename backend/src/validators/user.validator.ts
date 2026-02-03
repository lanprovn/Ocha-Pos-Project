/**
 * User Validators using Zod
 * Centralized validation schemas for user-related inputs
 */

import { z } from 'zod';

// ===== Enums =====
export const UserRoleEnum = z.enum(['ADMIN', 'STAFF', 'CUSTOMER']);

// ===== Password Validation =====
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

// ===== Create User Schema =====
export const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    name: z.string().min(1, 'Name is required').max(100),
    role: UserRoleEnum.default('STAFF'),
});

// ===== Update User Schema =====
export const updateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    role: UserRoleEnum.optional(),
    isActive: z.boolean().optional(),
});

// ===== Change Password Schema =====
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
}).refine(
    (data) => data.currentPassword !== data.newPassword,
    { message: 'New password must be different from current password', path: ['newPassword'] }
);

// ===== Login Schema =====
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// ===== User Filters Schema =====
export const userFiltersSchema = z.object({
    search: z.string().optional(),
    role: UserRoleEnum.optional(),
    isActive: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ===== Type Exports =====
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
