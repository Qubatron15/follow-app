/**
 * Helper functions for authentication in API routes
 */

/**
 * Creates a standardized 401 Unauthorized response
 */
export function createUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      },
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Asserts that user is authenticated, returns 401 response if not
 * Use this at the beginning of API route handlers
 */
export function requireAuth(user: { id: string; email: string } | null): user is { id: string; email: string } {
  return user !== null;
}
