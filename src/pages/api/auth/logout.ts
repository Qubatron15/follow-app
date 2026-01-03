import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { createAuthErrorResponse } from "../../../lib/errors/auth-errors";

export const prerender = false;

/**
 * POST /api/auth/logout
 * Signs out the current user and clears session cookies
 *
 * Response:
 * - 200: Success (empty body)
 * - 500: Server error
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Create Supabase server instance with SSR support
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Sign out user
    const { error } = await supabase.auth.signOut();

    if (error) {
      return createAuthErrorResponse("AUTH_UNKNOWN", "Nie udało się wylogować. Spróbuj ponownie.", 500);
    }

    // Return success
    return new Response(null, { status: 200 });
  } catch {
    return createAuthErrorResponse("AUTH_UNKNOWN", "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.", 500);
  }
};
