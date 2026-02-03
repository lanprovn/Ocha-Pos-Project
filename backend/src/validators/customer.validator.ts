/**
 * Customer Validators using Zod
 * Centralized validation schemas for customer-related inputs
 */

import { z } from 'zod';

// ===== Enums =====
export const MembershipLevelEnum = z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']);

export const LoyaltyTransactionTypeEnum = z.enum(['EARN', 'REDEEM', 'EXPIRED', 'ADJUSTMENT']);

// ===== Phone Number Regex (Vietnam) =====
const vietnamPhoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

// ===== Create Customer Schema =====
export const createCustomerSchema = z.object({
    name: z.string().min(1, 'Customer name is required').max(100),
    phone: z.string()
        .min(10, 'Phone number too short')
        .max(15, 'Phone number too long')
        .regex(vietnamPhoneRegex, 'Invalid Vietnam phone number'),
    email: z.string().email('Invalid email').nullable().optional(),
    address: z.string().max(500).nullable().optional(),
    dateOfBirth: z.string().datetime().nullable().optional(),
    gender: z.enum(['male', 'female', 'other']).nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
    tags: z.array(z.string().max(50)).optional().default([]),
});

// ===== Update Customer Schema =====
export const updateCustomerSchema = createCustomerSchema.partial().extend({
    isActive: z.boolean().optional(),
    loyaltyPoints: z.number().int().nonnegative().optional(),
    membershipLevel: MembershipLevelEnum.optional(),
});

// ===== Customer Filters Schema =====
export const customerFiltersSchema = z.object({
    search: z.string().optional(),
    membershipLevel: MembershipLevelEnum.optional(),
    tags: z.string().optional(), // Comma-separated
    isActive: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ===== Add Loyalty Points Schema =====
export const addLoyaltyPointsSchema = z.object({
    points: z.number().int().positive('Points must be positive'),
    reason: z.string().max(200).optional(),
    orderId: z.string().uuid().optional(),
});

// ===== Redeem Loyalty Points Schema =====
export const redeemLoyaltyPointsSchema = z.object({
    points: z.number().int().positive('Points must be positive'),
    reason: z.string().max(200).optional(),
    orderId: z.string().uuid().optional(),
});

// ===== Type Exports =====
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerFilters = z.infer<typeof customerFiltersSchema>;
export type AddLoyaltyPointsInput = z.infer<typeof addLoyaltyPointsSchema>;
export type RedeemLoyaltyPointsInput = z.infer<typeof redeemLoyaltyPointsSchema>;
