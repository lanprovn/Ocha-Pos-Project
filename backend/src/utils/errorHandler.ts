/**
 * Helper function to safely extract error message
 * Replaces any types with proper type checking
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Internal server error';
}

/**
 * Check if error is a specific error message
 */
export function isErrorWithMessage(error: unknown, message: string): boolean {
  return error instanceof Error && error.message === message;
}

