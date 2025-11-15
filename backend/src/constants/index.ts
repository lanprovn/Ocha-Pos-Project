/**
 * Backend Constants
 * Centralized constants for better maintainability and consistency
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
} as const;

// ===== Error Messages =====
export const ERROR_MESSAGES = {
  // Validation
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  REQUIRED_FIELD: 'Trường này là bắt buộc.',
  INVALID_FORMAT: 'Định dạng không hợp lệ.',
  
  // Authentication
  UNAUTHORIZED: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  INVALID_TOKEN: 'Token không hợp lệ. Vui lòng đăng nhập lại.',
  TOKEN_EXPIRED: 'Token đã hết hạn. Vui lòng đăng nhập lại.',
  
  // Not Found
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  USER_NOT_FOUND: 'Không tìm thấy người dùng.',
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục.',
  
  // Database
  DATABASE_ERROR: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.',
  UNIQUE_CONSTRAINT: 'Dữ liệu đã tồn tại trong hệ thống.',
  
  // File
  FILE_NOT_FOUND: 'Không tìm thấy file.',
  FILE_UPLOAD_ERROR: 'Lỗi khi upload file. Vui lòng thử lại.',
  
  // Payment
  PAYMENT_ERROR: 'Lỗi khi xử lý thanh toán. Vui lòng thử lại.',
  PAYMENT_VERIFICATION_FAILED: 'Xác thực thanh toán thất bại.',
  
  // Order
  ORDER_ALREADY_COMPLETED: 'Đơn hàng đã hoàn thành.',
  ORDER_ALREADY_CANCELLED: 'Đơn hàng đã bị hủy.',
  INVALID_ORDER_STATUS: 'Trạng thái đơn hàng không hợp lệ.',
  
  // Stock
  INSUFFICIENT_STOCK: 'Không đủ hàng trong kho.',
  STOCK_NOT_FOUND: 'Không tìm thấy thông tin kho.',
  
  // Generic
  INTERNAL_SERVER_ERROR: 'Lỗi hệ thống. Vui lòng thử lại sau.',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định.',
} as const;

// ===== Success Messages =====
export const SUCCESS_MESSAGES = {
  CREATED: 'Tạo thành công.',
  UPDATED: 'Cập nhật thành công.',
  DELETED: 'Xóa thành công.',
  LOGGED_IN: 'Đăng nhập thành công.',
  LOGGED_OUT: 'Đăng xuất thành công.',
  ORDER_CREATED: 'Tạo đơn hàng thành công.',
  ORDER_UPDATED: 'Cập nhật đơn hàng thành công.',
  ORDER_CANCELLED: 'Hủy đơn hàng thành công.',
  PAYMENT_SUCCESS: 'Thanh toán thành công.',
} as const;

// ===== Order Status =====
export const ORDER_STATUS = {
  CREATING: 'CREATING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ===== Payment Status =====
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatusType = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// ===== Payment Method =====
export const PAYMENT_METHOD = {
  CASH: 'cash',
  QR: 'qr',
  CARD: 'card',
} as const;

export type PaymentMethodType = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

// ===== User Roles =====
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];

// ===== Pagination =====
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ===== Order Number Prefix =====
export const ORDER_NUMBER_PREFIX = 'ORD';

// ===== Socket Events =====
export const SOCKET_EVENTS = {
  // Client to Server
  SUBSCRIBE_ORDERS: 'subscribe_orders',
  SUBSCRIBE_DISPLAY: 'subscribe_display',
  SUBSCRIBE_DASHBOARD: 'subscribe_dashboard',
  
  // Server to Client
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  DASHBOARD_UPDATE: 'dashboard_update',
} as const;

// ===== File Upload =====
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  UPLOAD_DIR: 'uploads/images',
} as const;

// ===== Rate Limiting =====
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 5, // Lower limit for auth endpoints
} as const;

