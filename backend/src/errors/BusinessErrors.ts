import { AppError } from './AppError';

/**
 * Error khi không đủ tồn kho
 */
export class InsufficientStockError extends AppError {
  statusCode = 400;
  errorCode = 'INSUFFICIENT_STOCK';

  constructor(productId: string, productName: string, available: number, requested: number) {
    super(
      `Không đủ tồn kho cho sản phẩm "${productName}". Tồn kho hiện tại: ${available}, yêu cầu: ${requested}`,
      { productId, productName, available, requested },
      true
    );
  }

  serialize() {
    return {
      error: this.message,
      errorCode: this.errorCode,
      details: this.details,
    };
  }
}

/**
 * Error khi order không tồn tại
 */
export class OrderNotFoundError extends AppError {
  statusCode = 404;
  errorCode = 'ORDER_NOT_FOUND';

  constructor(orderId: string) {
    super(`Đơn hàng không tồn tại`, { orderId }, true);
  }

  serialize() {
    return {
      error: this.message,
      errorCode: this.errorCode,
      details: this.details,
    };
  }
}

/**
 * Error khi product không tồn tại
 */
export class ProductNotFoundError extends AppError {
  statusCode = 404;
  errorCode = 'PRODUCT_NOT_FOUND';

  constructor(productId: string) {
    super(`Sản phẩm không tồn tại`, { productId }, true);
  }

  serialize() {
    return {
      error: this.message,
      errorCode: this.errorCode,
      details: this.details,
    };
  }
}

/**
 * Error khi validation thất bại
 */
export class ValidationError extends AppError {
  statusCode = 400;
  errorCode = 'VALIDATION_ERROR';

  constructor(message: string, details: any) {
    super(message, details, true);
  }

  serialize() {
    return {
      error: this.message,
      errorCode: this.errorCode,
      details: this.details,
    };
  }
}

/**
 * Error khi không có quyền truy cập
 */
export class UnauthorizedError extends AppError {
  statusCode = 401;
  errorCode = 'UNAUTHORIZED';

  constructor(message = 'Không có quyền truy cập') {
    super(message, undefined, true);
  }

  serialize() {
    return {
      error: this.message,
      errorCode: this.errorCode,
    };
  }
}

/**
 * Error khi không đủ quyền
 */
export class ForbiddenError extends AppError {
  statusCode = 403;
  errorCode = 'FORBIDDEN';

  constructor(message = 'Không đủ quyền thực hiện hành động này') {
    super(message, undefined, true);
  }

  serialize() {
    return {
      error: this.message,
      errorCode: this.errorCode,
    };
  }
}

