import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

/**
 * Rate Limiter Middleware
 * Prevents brute force attacks and DDoS
 */

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per window
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // Skip successful requests in count
    skipSuccessfulRequests: false,
    // Skip failed requests in count
    skipFailedRequests: false,
});

// Strict limiter for authentication endpoints - 5 requests per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 login attempts
    message: {
        error: 'Too many login attempts, please try again after 15 minutes',
        errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Only count failed requests
    skipSuccessfulRequests: true,
});

// Moderate limiter for data modification - 50 requests per 15 minutes
export const modificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        error: 'Too many modification requests, please try again later',
        errorCode: 'MODIFICATION_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Relaxed limiter for read-only operations - 200 requests per 15 minutes
export const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        error: 'Too many requests, please try again later',
        errorCode: 'READ_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

// Very strict limiter for password reset - 3 requests per hour
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        error: 'Too many password reset attempts, please try again after 1 hour',
        errorCode: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// File upload limiter - 10 uploads per 15 minutes
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: 'Too many file uploads, please try again later',
        errorCode: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Custom key generator for rate limiting by user ID (for authenticated routes)
 */
export const createUserRateLimiter = (max: number, windowMs: number = 15 * 60 * 1000) => {
    return rateLimit({
        windowMs,
        max,
        keyGenerator: (req: Request) => {
            // Use user ID if authenticated, otherwise IP
            const user = (req as any).user;
            return user?.id || req.ip || 'unknown';
        },
        message: {
            error: 'Too many requests from your account, please try again later',
            errorCode: 'USER_RATE_LIMIT_EXCEEDED',
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

/**
 * Rate limiter for expensive operations (reports, exports)
 */
export const expensiveOperationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Max 10 expensive operations per hour
    message: {
        error: 'Too many resource-intensive requests, please try again after 1 hour',
        errorCode: 'EXPENSIVE_OPERATION_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        const user = (req as any).user;
        return user?.id || req.ip || 'unknown';
    },
});
