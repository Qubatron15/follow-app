import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  // Auth pages
  "/login",
  "/register",
  "/reset",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset",
];

/**
 * Middleware for authentication and session management
 * - Creates Supabase server instance with SSR support
 * - Checks user authentication status
 * - Redirects unauthenticated users to login page
 * - Makes user data available in context.locals
 */
export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create Supabase server instance with SSR support
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Make supabase client available in context (for backward compatibility)
  locals.supabase = supabase;

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Store user in locals
  if (user) {
    locals.user = {
      id: user.id,
      email: user.email || "",
    };
  } else {
    locals.user = null;
  }

  // Check if current path is public
  const isPublicPath = PUBLIC_PATHS.some((path) => url.pathname.startsWith(path));

  // Redirect to login if user is not authenticated and trying to access protected route
  if (!user && !isPublicPath) {
    return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  return next();
});
