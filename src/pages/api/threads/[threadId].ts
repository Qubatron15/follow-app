import type { APIContext } from "astro";
import { updateThreadSchema } from "../../../lib/schemas/threads.schema";
import { threadsService, ThreadServiceError } from "../../../lib/services/threads.service";
import {
  mapServiceErrorToHttpResponse,
  createValidationErrorResponse,
  createInternalServerErrorResponse,
} from "../../../lib/errors";

// Disable prerendering for this API route to enable server-side processing
export const prerender = false;

/**
 * Updates an existing thread's name for the authenticated user.
 *
 * PATCH /api/threads/{threadId}
 *
 * Request body:
 * {
 *   "name": "New thread name" // string, 1-20 characters, unique per user
 * }
 *
 * Responses:
 * - 200: Thread updated successfully
 * - 400: Invalid input data
 * - 401: Authentication required
 * - 404: Thread not found
 * - 409: Thread name already exists
 * - 500: Internal server error
 */
export async function PATCH(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client and threadId from context
    const { supabase } = context.locals;
    const { threadId } = context.params;

    if (!threadId) {
      return createValidationErrorResponse("Thread ID is required");
    }

    // Step 2: Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await context.request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return createValidationErrorResponse("Invalid JSON in request body");
    }

    // Step 3: Validate input using Zod schema
    const validationResult = updateThreadSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return createValidationErrorResponse("Thread name must be between 1 and 20 characters");
    }

    // Step 4: Update thread using service layer
    const threadData = await threadsService.updateThread(
      supabase,
      "24a19ed0-7584-4377-a10f-326c63d9f927",
      threadId,
      validationResult.data.name
    );

    // Step 5: Return successful response
    const successResponse = {
      data: threadData,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Step 6: Handle service errors
    if (error instanceof ThreadServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 7: Handle unexpected errors
    console.error("Unexpected error in PATCH /api/threads/{threadId}:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while updating the thread");
  }
}

/**
 * Deletes a thread and all its associated data (transcripts, action points).
 * This is a hard delete - the data cannot be recovered.
 *
 * DELETE /api/threads/{threadId}
 *
 * Responses:
 * - 204: Thread deleted successfully (no content)
 * - 401: Authentication required
 * - 500: Internal server error
 *
 * Note: DELETE is idempotent - deleting a non-existent thread returns 204
 */
export async function DELETE(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client and threadId from context
    const { supabase } = context.locals;
    const { threadId } = context.params;

    if (!threadId) {
      return createValidationErrorResponse("Thread ID is required");
    }

    // Step 2: Delete thread using service layer
    await threadsService.deleteThread(supabase, "24a19ed0-7584-4377-a10f-326c63d9f927", threadId);

    // Step 3: Return successful response (204 No Content)
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Step 4: Handle service errors
    if (error instanceof ThreadServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 5: Handle unexpected errors
    console.error("Unexpected error in DELETE /api/threads/{threadId}:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while deleting the thread");
  }
}
