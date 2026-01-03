import type { ErrorResponse } from "../../types";

/**
 * Auth error codes following auth-spec.md specification
 */
export const AUTH_ERRORS = {
  AUTH_INVALID: "AUTH_INVALID",
  AUTH_DUPLICATE: "AUTH_DUPLICATE",
  AUTH_WEAK_PW: "AUTH_WEAK_PW",
  AUTH_UNKNOWN: "AUTH_UNKNOWN",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

/**
 * Maps Supabase Auth error messages to application error codes
 * Based on auth-spec.md section 5.2
 */
export function mapSupabaseAuthError(error: { message: string; status?: number }): {
  code: string;
  message: string;
  status: number;
} {
  const errorMessage = error.message.toLowerCase();

  // Invalid credentials
  if (errorMessage.includes("invalid login") || errorMessage.includes("invalid credentials")) {
    return {
      code: AUTH_ERRORS.AUTH_INVALID,
      message: "Niepoprawny e-mail lub hasło.",
      status: 401,
    };
  }

  // User already exists
  if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
    return {
      code: AUTH_ERRORS.AUTH_DUPLICATE,
      message: "Konto z tym adresem już istnieje.",
      status: 409,
    };
  }

  // Weak password
  if (errorMessage.includes("password") && errorMessage.includes("weak")) {
    return {
      code: AUTH_ERRORS.AUTH_WEAK_PW,
      message: "Hasło nie spełnia kryteriów bezpieczeństwa.",
      status: 400,
    };
  }

  // Default unknown error
  return {
    code: AUTH_ERRORS.AUTH_UNKNOWN,
    message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    status: 500,
  };
}

/**
 * Creates a standardized auth error response
 */
export function createAuthErrorResponse(code: string, message: string, status: number): Response {
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
    },
  };

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
