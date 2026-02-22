import { NextResponse } from 'next/server';

/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Convert ApiError to NextResponse
   */
  toResponse(): Response {
    return NextResponse.json(
      {
        error: this.message,
        ...(this.details && { details: this.details }),
      },
      { status: this.statusCode }
    );
  }
}

/**
 * Standard API error handler
 * Converts errors to consistent JSON responses
 *
 * @param error - The error to handle
 * @returns NextResponse with appropriate status code and error message
 *
 * @example
 * try {
 *   // Your code here
 * } catch (error) {
 *   return handleApiError(error);
 * }
 */
export function handleApiError(error: unknown): Response {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return error.toResponse();
  }

  // Handle known error types
  if (error instanceof Error) {
    // Unauthorized errors
    if (error.message === 'Unauthorized') {
      return ApiErrors.Unauthorized().toResponse();
    }

    // Generic error with message
    console.error('Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }

  // Unknown error type
  console.error('Unknown error type:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

/**
 * Standard API errors
 * Pre-defined error types for common scenarios
 */
export const ApiErrors = {
  /**
   * 400 Bad Request - Invalid input
   */
  BadRequest: (message = 'Bad request', details?: any) =>
    new ApiError(400, message, details),

  /**
   * 400 Validation Error - Input validation failed
   */
  ValidationError: (details: any) =>
    new ApiError(400, 'Validation failed', details),

  /**
   * 401 Unauthorized - Authentication required
   */
  Unauthorized: (message = 'Unauthorized') =>
    new ApiError(401, message),

  /**
   * 403 Forbidden - Authenticated but not authorized
   */
  Forbidden: (message = 'Forbidden') =>
    new ApiError(403, message),

  /**
   * 404 Not Found - Resource doesn't exist
   */
  NotFound: (resource = 'Resource') =>
    new ApiError(404, `${resource} not found`),

  /**
   * 409 Conflict - Request conflicts with current state
   */
  Conflict: (message: string) =>
    new ApiError(409, message),

  /**
   * 422 Unprocessable Entity - Semantically invalid
   */
  UnprocessableEntity: (message: string, details?: any) =>
    new ApiError(422, message, details),

  /**
   * 429 Too Many Requests - Rate limit exceeded
   */
  TooManyRequests: (message = 'Too many requests', details?: any) =>
    new ApiError(429, message, details),

  /**
   * 500 Internal Server Error
   */
  InternalServerError: (message = 'Internal server error', details?: any) =>
    new ApiError(500, message, details),

  /**
   * 503 Service Unavailable
   */
  ServiceUnavailable: (message = 'Service temporarily unavailable') =>
    new ApiError(503, message),
};

/**
 * Validation error formatter for Zod validation results
 *
 * @example
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   return formatValidationError(result.error).toResponse();
 * }
 */
export function formatValidationError(zodError: any): ApiError {
  const details = zodError.issues.map((issue: any) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

  return ApiErrors.ValidationError(details);
}

/**
 * Higher-order function to wrap route handlers with error handling
 *
 * @param handler - The route handler function
 * @returns Wrapped handler with automatic error handling
 *
 * @example
 * export const GET = withErrorHandler(async (request) => {
 *   // Your code here - errors will be caught and formatted automatically
 *   const data = await fetchData();
 *   return NextResponse.json({ data });
 * });
 */
export function withErrorHandler(
  handler: (request: Request, ...args: any[]) => Promise<Response>
) {
  return async (request: Request, ...args: any[]): Promise<Response> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
