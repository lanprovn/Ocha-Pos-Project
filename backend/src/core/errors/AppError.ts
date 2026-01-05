/**
 * Base abstract class for all application errors
 */
export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract errorCode: string;
  
  constructor(
    message: string,
    public details?: any,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  abstract serialize(): {
    error: string;
    errorCode: string;
    details?: any;
  };
}

