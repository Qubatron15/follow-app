import type { APIContext } from "astro";
import { createThreadSchema } from "../../../lib/schemas/threads.schema";
import { threadsService, ThreadServiceError } from "../../../lib/services/threads.service";
import {
  mapServiceErrorToHttpResponse,
  createValidationErrorResponse,
  createInternalServerErrorResponse,
} from "../../../lib/errors";

// Disable prerendering for this API route to enable server-side processing
export const prerender = false;

/**
 * Retrieves all threads for the authenticated user.
 *
 * GET /api/threads
 *
 * Responses:
 * - 200: List of threads returned successfully
 * - 401: Authentication required
 * - 500: Internal server error
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client and user from context
    const { supabase, user } = context.locals;

    if (!user) {
      return new Response(JSON.stringify({ error: { code: "AUTH_REQUIRED", message: "Authentication required" } }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 2: Fetch threads using service layer
    const threads = await threadsService.getThreadsByUser(supabase, user.id);

    // Step 3: Return successful response
    const successResponse = {
      data: threads,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Step 4: Handle service errors
    if (error instanceof ThreadServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 5: Handle unexpected errors
    console.error("Unexpected error in GET /api/threads:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while fetching threads");
  }
}

/**
 * Creates a new thread for the authenticated user.
 *
 * POST /api/threads
 *
 * Request body:
 * {
 *   "name": "Thread name" // string, 1-20 characters, unique per user
 * }
 *
 * Responses:
 * - 201: Thread created successfully
 * - 400: Invalid input data
 * - 401: Authentication required
 * - 409: Thread name already exists
 * - 429: Thread limit reached (max 20)
 * - 500: Internal server error
 */
export async function POST(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client and user from context
    const { supabase, user } = context.locals;

    if (!user) {
      return new Response(JSON.stringify({ error: { code: "AUTH_REQUIRED", message: "Authentication required" } }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 2: Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await context.request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return createValidationErrorResponse("Invalid JSON in request body");
    }

    // Step 4: Validate input using Zod schema
    const validationResult = createThreadSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return createValidationErrorResponse("Thread name must be between 1 and 20 characters");
    }

    // Step 5: Create thread using service layer
    const threadData = await threadsService.createThread(supabase, user.id, validationResult.data.name);

    // Step 6: Return successful response
    const successResponse = {
      data: threadData,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Step 7: Handle service errors
    if (error instanceof ThreadServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 8: Handle unexpected errors
    console.error("Unexpected error in POST /api/threads:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while creating the thread");
  }
}
