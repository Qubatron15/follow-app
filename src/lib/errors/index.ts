import type { ErrorResponse } from "../../types";
import { ThreadServiceError } from "../services/threads.service";
import { THREAD_ERRORS } from "../schemas/threads.schema";

/**
 * Maps service errors to HTTP status codes.
 * Provides consistent status code mapping across the application.
 */
const ERROR_STATUS_MAP: Record<string, number> = {
  [THREAD_ERRORS.THREAD_NAME_INVALID]: 400,
  [THREAD_ERRORS.THREAD_NAME_DUPLICATE]: 409,
  [THREAD_ERRORS.THREAD_LIMIT_REACHED]: 429,
  [THREAD_ERRORS.AUTH_REQUIRED]: 401,
  [THREAD_ERRORS.INTERNAL_SERVER_ERROR]: 500,
} as const;

/**
 * Creates a standardized error response object.
 * 
 * @param code - Application-specific error code
 * @param message - Human-readable error message
 * @returns ErrorResponse object with consistent structure
 */
export function createErrorResponse(code: string, message: string): ErrorResponse {
  return {
    error: {
      code,
      message,
    },
  };
}

/**
 * Maps ThreadServiceError to HTTP Response with appropriate status code.
 * Provides consistent error response format and logging.
 * 
 * @param error - ThreadServiceError instance
 * @param requestId - Optional request ID for logging correlation
 * @returns HTTP Response with error details
 */
export function mapServiceErrorToHttpResponse(
  error: ThreadServiceError,
  requestId?: string
): Response {
  // Log error with request correlation if available
  const logPrefix = requestId ? `[${requestId}]` : "";
  console.error(`${logPrefix} Service error [${error.code}]:`, error.message);

  const errorResponse = createErrorResponse(error.code, error.message);
  const statusCode = ERROR_STATUS_MAP[error.code] || 500;

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Creates a generic internal server error response.
 * Used as fallback for unexpected errors.
 * 
 * @param message - Optional custom error message
 * @param requestId - Optional request ID for logging correlation
 * @returns HTTP Response with 500 status
 */
export function createInternalServerErrorResponse(
  message: string = "An unexpected error occurred",
  requestId?: string
): Response {
  const logPrefix = requestId ? `[${requestId}]` : "";
  console.error(`${logPrefix} Internal server error:`, message);

  const errorResponse = createErrorResponse(
    THREAD_ERRORS.INTERNAL_SERVER_ERROR,
    message
  );

  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Creates an authentication required error response.
 * Used when user authentication is missing or invalid.
 * 
 * @param message - Optional custom error message
 * @returns HTTP Response with 401 status
 */
export function createAuthRequiredResponse(
  message: string = "Authentication required"
): Response {
  const errorResponse = createErrorResponse(THREAD_ERRORS.AUTH_REQUIRED, message);

  return new Response(JSON.stringify(errorResponse), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Creates a validation error response for invalid input data.
 * Used when request data fails validation.
 * 
 * @param message - Specific validation error message
 * @returns HTTP Response with 400 status
 */
export function createValidationErrorResponse(
  message: string = "Invalid input data"
): Response {
  const errorResponse = createErrorResponse(THREAD_ERRORS.THREAD_NAME_INVALID, message);

  return new Response(JSON.stringify(errorResponse), {
    status: 400,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
