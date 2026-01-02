import type { APIContext } from "astro";
import { createTranscriptSchema, uuidSchema } from "../../../../../lib/schemas/transcripts.schema";
import { transcriptsService, TranscriptServiceError } from "../../../../../lib/services/transcripts.service";
import {
  mapServiceErrorToHttpResponse,
  createValidationErrorResponse,
  createInternalServerErrorResponse,
} from "../../../../../lib/errors";

// Disable prerendering for this API route to enable server-side processing
export const prerender = false;

/**
 * Retrieves all transcripts for a specific thread.
 *
 * GET /api/threads/{threadId}/transcripts
 *
 * Responses:
 * - 200: List of transcripts returned successfully
 * - 400: Invalid threadId
 * - 401: Authentication required
 * - 404: Thread not found or doesn't belong to user
 * - 500: Internal server error
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client and threadId from context
    const { supabase } = context.locals;
    const { threadId } = context.params;

    // Step 2: Validate threadId
    if (!threadId) {
      return createValidationErrorResponse("Thread ID is required");
    }

    const threadIdValidation = uuidSchema.safeParse(threadId);
    if (!threadIdValidation.success) {
      return createValidationErrorResponse("Invalid thread ID format");
    }

    // Step 3: Fetch transcripts using service layer
    const transcripts = await transcriptsService.list(
      supabase,
      "24a19ed0-7584-4377-a10f-326c63d9f927",
      threadId
    );

    // Step 4: Return successful response
    const successResponse = {
      data: transcripts,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Step 5: Handle service errors
    if (error instanceof TranscriptServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 6: Handle unexpected errors
    console.error("Unexpected error in GET /api/threads/{threadId}/transcripts:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while fetching transcripts");
  }
}

/**
 * Creates a new transcript for a specific thread.
 *
 * POST /api/threads/{threadId}/transcripts
 *
 * Request body:
 * {
 *   "content": "Transcript content" // string, 1-30,000 characters
 * }
 *
 * Responses:
 * - 201: Transcript created successfully
 * - 400: Invalid input data or threadId
 * - 401: Authentication required
 * - 404: Thread not found or doesn't belong to user
 * - 500: Internal server error
 */
export async function POST(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client and threadId from context
    const { supabase } = context.locals;
    const { threadId } = context.params;

    // Step 2: Validate threadId
    if (!threadId) {
      return createValidationErrorResponse("Thread ID is required");
    }

    const threadIdValidation = uuidSchema.safeParse(threadId);
    if (!threadIdValidation.success) {
      return createValidationErrorResponse("Invalid thread ID format");
    }

    // Step 3: Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await context.request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return createValidationErrorResponse("Invalid JSON in request body");
    }

    // Step 4: Validate input using Zod schema
    const validationResult = createTranscriptSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return createValidationErrorResponse("Transcript content must be between 1 and 30,000 characters");
    }

    // Step 5: Create transcript using service layer
    const transcriptData = await transcriptsService.create(
      supabase,
      "24a19ed0-7584-4377-a10f-326c63d9f927",
      threadId,
      validationResult.data.content
    );

    // Step 6: Return successful response
    const successResponse = {
      data: transcriptData,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Step 7: Handle service errors
    if (error instanceof TranscriptServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 8: Handle unexpected errors
    console.error("Unexpected error in POST /api/threads/{threadId}/transcripts:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while creating the transcript");
  }
}
