import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { registerSchema } from "../../../lib/schemas/auth.schema";
import { mapSupabaseAuthError, createAuthErrorResponse } from "../../../lib/errors/auth-errors";
import { createValidationErrorResponse } from "../../../lib/errors";

export const prerender = false;

/**
 * POST /api/auth/register
 * Registers a new user with email and password
 * User is automatically logged in after successful registration
 *
 * Request body:
 * - email: string (validated by Zod)
 * - password: string (validated by Zod)
 * - confirmPassword: string (validated by Zod)
 *
 * Response:
 * - 200: { user: { id, email } }
 * - 400: Validation error
 * - 409: User already exists
 * - 500: Server error
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const result = registerSchema.safeParse(body);
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

    // Attempt to sign up with email confirmation disabled
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/threads`,
        data: {
          email_confirm: true, // Auto-confirm email
        },
      },
    });

    if (error) {
      const mappedError = mapSupabaseAuthError(error);
      return createAuthErrorResponse(mappedError.code, mappedError.message, mappedError.status);
    }

    // User is now registered and automatically logged in
    // Session cookies are set by Supabase SSR
    return new Response(
      JSON.stringify({
        user: {
          id: data.user?.id,
          email: data.user?.email,
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
