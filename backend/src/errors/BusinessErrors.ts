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

/**
 * Error khi promotion code không tồn tại
 */
export class PromotionCodeNotFoundError extends AppError {
  statusCode = 404;
  errorCode = 'PROMOTION_CODE_NOT_FOUND';

  constructor(code: string) {
    super(`Mã giảm giá "${code}" không tồn tại`, { code }, true);
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
 * Error khi promotion code không hợp lệ
 */
export class InvalidPromotionCodeError extends AppError {
  statusCode = 400;
  errorCode = 'INVALID_PROMOTION_CODE';

  constructor(message: string, details?: any) {
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
 * Error khi shift không tồn tại
 */
export class ShiftNotFoundError extends AppError {
  statusCode = 404;
  errorCode = 'SHIFT_NOT_FOUND';

  constructor(shiftId: string) {
    super(`Ca làm việc không tồn tại`, { shiftId }, true);
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
 * Error khi shift đã đóng
 */
export class ShiftAlreadyClosedError extends AppError {
  statusCode = 400;
  errorCode = 'SHIFT_ALREADY_CLOSED';

  constructor(shiftNumber: string) {
    super(`Ca làm việc "${shiftNumber}" đã được đóng`, { shiftNumber }, true);
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
 * Error khi có shift đang mở
 */
export class ShiftAlreadyOpenError extends AppError {
  statusCode = 400;
  errorCode = 'SHIFT_ALREADY_OPEN';

  constructor(message = 'Đã có ca làm việc đang mở. Vui lòng đóng ca hiện tại trước khi mở ca mới') {
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
 * Error khi supplier không tồn tại
 */
export class SupplierNotFoundError extends AppError {
  statusCode = 404;
  errorCode = 'SUPPLIER_NOT_FOUND';

  constructor(supplierId: string) {
    super(`Nhà cung cấp không tồn tại`, { supplierId }, true);
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
 * Error khi purchase order không tồn tại
 */
export class PurchaseOrderNotFoundError extends AppError {
  statusCode = 404;
  errorCode = 'PURCHASE_ORDER_NOT_FOUND';

  constructor(orderId: string) {
    super(`Đơn nhập hàng không tồn tại`, { orderId }, true);
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
 * Error khi purchase order không thể nhận hàng
 */
export class InvalidPurchaseOrderStatusError extends AppError {
  statusCode = 400;
  errorCode = 'INVALID_PURCHASE_ORDER_STATUS';

  constructor(message: string, details?: any) {
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
 * Error khi expense không tồn tại
 */
export class ExpenseNotFoundError extends AppError {
  statusCode = 404;
  errorCode = 'EXPENSE_NOT_FOUND';

  constructor(expenseId: string) {
    super(`Chi phí không tồn tại`, { expenseId }, true);
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
 * Error khi expense category không tồn tại
 */
export class ExpenseCategoryNotFoundError extends AppError {
  statusCode = 404;
  errorCode = 'EXPENSE_CATEGORY_NOT_FOUND';

  constructor(categoryId: string) {
    super(`Danh mục chi phí không tồn tại`, { categoryId }, true);
  }

  serialize() {
    return {
      error: this.message,
      errorCode: this.errorCode,
      details: this.details,
    };
  }
}

