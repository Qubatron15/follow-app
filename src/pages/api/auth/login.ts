import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { loginSchema } from "../../../lib/schemas/auth.schema";
import { mapSupabaseAuthError, createAuthErrorResponse } from "../../../lib/errors/auth-errors";
import { createValidationErrorResponse } from "../../../lib/errors";

export const prerender = false;

/**
 * POST /api/auth/login
 * Authenticates user with email and password
 *
 * Request body:
 * - email: string (validated by Zod)
 * - password: string (validated by Zod)
 *
 * Response:
 * - 200: { user: { id, email } }
 * - 400: Validation error
 * - 401: Invalid credentials
 * - 500: Server error
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return createValidationErrorResponse(firstError?.message || "Nieprawidłowe dane wejściowe");
    }

    const { email, password } = result.data;

    // Create Supabase server instance with SSR support
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const mappedError = mapSupabaseAuthError(error);
      return createAuthErrorResponse(mappedError.code, mappedError.message, mappedError.status);
    }

    // Return user data (session is automatically stored in cookies by Supabase)
    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    return createAuthErrorResponse("AUTH_UNKNOWN", "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.", 500);
  }
};
