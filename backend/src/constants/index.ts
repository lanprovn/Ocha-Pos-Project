/**
 * Backend Constants
 * Centralized constants for the backend application
 */

// ===== HTTP Status Codes =====
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

// ===== Error Codes =====
export const ERROR_CODES = {
    // Authentication
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    UNAUTHORIZED: 'UNAUTHORIZED',

    // Authorization
    FORBIDDEN: 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',

    // Resource
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

    // Business Logic
    INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
    ORDER_CANNOT_BE_CANCELLED: 'ORDER_CANNOT_BE_CANCELLED',
    ORDER_ALREADY_PAID: 'ORDER_ALREADY_PAID',
    INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',
    INSUFFICIENT_LOYALTY_POINTS: 'INSUFFICIENT_LOYALTY_POINTS',

    // System
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

// ===== Pagination Defaults =====
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
} as const;

// ===== Date Formats =====
export const DATE_FORMATS = {
    DATE_ONLY: 'YYYY-MM-DD',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    TIME_ONLY: 'HH:mm:ss',
    DISPLAY: 'DD/MM/YYYY HH:mm',
} as const;

// ===== Loyalty Points Configuration =====
export const LOYALTY_CONFIG = {
    POINTS_PER_1000_VND: 1, // 1 point per 1000 VND spent
    MIN_ORDER_FOR_POINTS: 10000, // Minimum order amount to earn points
    POINTS_EXPIRY_DAYS: 365, // Points expire after 1 year
} as const;

// ===== Stock Alert Thresholds =====
export const STOCK_THRESHOLDS = {
    LOW_STOCK_PERCENTAGE: 20, // Alert when stock is below 20% of max
    CRITICAL_STOCK_PERCENTAGE: 10, // Critical when below 10%
    OVERSTOCK_PERCENTAGE: 90, // Alert when stock is above 90% of max
} as const;

// ===== Order Settings =====
export const ORDER_SETTINGS = {
    AUTO_CANCEL_PENDING_HOURS: 24, // Auto-cancel pending orders after 24 hours
    HOLD_ORDER_MAX_HOURS: 48, // Maximum time for hold orders
    DEFAULT_ORDER_NUMBER_PREFIX: 'ORD',
} as const;

// ===== File Upload =====
export const UPLOAD_LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
} as const;

// ===== Cache TTL (Time To Live) =====
export const CACHE_TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
} as const;

// ===== QR Code Settings =====
export const QR_SETTINGS = {
    DEFAULT_BANK_CODE: 'CTG', // VietinBank
    QR_TEMPLATE: 'print',
    QR_SIZE: 300,
    QR_EXPIRY_MINUTES: 15,
} as const;

// ===== Rate Limiting =====
export const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // Max 100 requests per window
    STRICT_MAX_REQUESTS: 20, // For sensitive endpoints
} as const;

// ===== Regex Patterns =====
export const REGEX_PATTERNS = {
    VIETNAM_PHONE: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;

// ===== Socket Events =====
export const SOCKET_EVENTS = {
    // Connection
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',

    // Orders
    ORDER_CREATED: 'order:created',
    ORDER_UPDATED: 'order:updated',
    ORDER_DELETED: 'order:deleted',
    ORDER_STATUS_CHANGED: 'order:statusChanged',

    // Products
    PRODUCT_UPDATED: 'product:updated',
    PRODUCT_STOCK_CHANGED: 'product:stockChanged',

    // Stock
    STOCK_ALERT: 'stock:alert',

    // Display
    DISPLAY_SYNC: 'display:sync',
    DISPLAY_ORDER_TRACKING: 'display:orderTracking',

    // Rooms
    JOIN_ROOM: 'join:room',
    LEAVE_ROOM: 'leave:room',
} as const;

// ===== Database Constraints =====
export const DB_CONSTRAINTS = {
    MAX_STRING_LENGTH: 255,
    MAX_TEXT_LENGTH: 65535,
    MAX_TAGS_PER_PRODUCT: 10,
    MAX_SIZES_PER_PRODUCT: 5,
    MAX_TOPPINGS_PER_PRODUCT: 20,
    MAX_ITEMS_PER_ORDER: 50,
} as const;

// ===== Type Exports =====
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
