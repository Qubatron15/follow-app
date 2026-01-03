import type { APIContext } from "astro";
import { requireAuth, createUnauthorizedResponse } from "../../../lib/auth-helpers";
import { uuidSchema, updateTranscriptSchema } from "../../../lib/schemas/transcripts.schema";
import { transcriptsService, TranscriptServiceError } from "../../../lib/services/transcripts.service";
import { aiService } from "../../../lib/services/ai.service";
import {
  mapServiceErrorToHttpResponse,
  createValidationErrorResponse,
  createInternalServerErrorResponse,
} from "../../../lib/errors";

// Disable prerendering for this API route to enable server-side processing
export const prerender = false;

/**
 * Retrieves a single transcript by ID.
 * Verifies that the transcript belongs to a thread owned by the authenticated user.
 *
 * GET /api/transcripts/{transcriptId}
 *
 * Responses:
 * - 200: Transcript returned successfully
 * - 400: Invalid transcriptId format
 * - 401: Authentication required
 * - 404: Transcript not found or doesn't belong to user
 * - 500: Internal server error
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client, user, and transcriptId from context
    const { supabase, user } = context.locals;
    const { transcriptId } = context.params;

    if (!requireAuth(user)) {
      return createUnauthorizedResponse();
    }

    // Step 2: Validate transcriptId
    if (!transcriptId) {
      return createValidationErrorResponse("Transcript ID is required");
    }

    const transcriptIdValidation = uuidSchema.safeParse(transcriptId);
    if (!transcriptIdValidation.success) {
      return createValidationErrorResponse("Invalid transcript ID format");
    }

    // Step 3: Fetch transcript using service layer
    const transcriptData = await transcriptsService.get(supabase, user.id, transcriptId);

    // Step 4: Return successful response
    const successResponse = {
      data: transcriptData,
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
    console.error("Unexpected error in GET /api/transcripts/{transcriptId}:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while fetching the transcript");
  }
}

/**
 * Updates an existing transcript's content.
 * Uses OpenAI to analyze the transcript and generate relevant action points.
 * Verifies that the transcript belongs to a thread owned by the authenticated user.
 *
 * PATCH /api/transcripts/{transcriptId}
 *
 * Request body:
 * {
 *   "content": "Updated transcript content" // string, 1-30,000 characters
 * }
 *
 * Responses:
 * - 200: Transcript updated successfully (action points generated via AI)
 * - 400: Invalid input data or transcriptId format
 * - 401: Authentication required
 * - 404: Transcript not found or doesn't belong to user
 * - 500: Internal server error
 *
 * Note: If action points generation fails, the transcript is still updated successfully.
 */
export async function PATCH(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client, user, and transcriptId from context
    const { supabase, user } = context.locals;
    const { transcriptId } = context.params;

    if (!requireAuth(user)) {
      return createUnauthorizedResponse();
    }

    // Step 2: Validate transcriptId
    if (!transcriptId) {
      return createValidationErrorResponse("Transcript ID is required");
    }

    const transcriptIdValidation = uuidSchema.safeParse(transcriptId);
    if (!transcriptIdValidation.success) {
      return createValidationErrorResponse("Invalid transcript ID format");
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
    const validationResult = updateTranscriptSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return createValidationErrorResponse("Transcript content must be between 1 and 30,000 characters");
    }

    // Step 5: Update transcript using service layer
    const transcriptData = await transcriptsService.update(supabase, user.id, transcriptId, validationResult.data.content);

    // Step 6: Generate action points using AI based on transcript content
    const threadId = transcriptData.threadId;

    try {
      await aiService.generateActionPointsFromTranscript(supabase, user.id, threadId, validationResult.data.content);
    } catch (aiError) {
      // AI generation failed - return error to frontend
      console.error("AI action points generation failed:", aiError);
      return createInternalServerErrorResponse(
        aiError instanceof Error ? aiError.message : "Failed to generate action points using AI"
      );
    }

    // Step 7: Return successful response
    const successResponse = {
      data: transcriptData,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Step 8: Handle service errors
    if (error instanceof TranscriptServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 9: Handle unexpected errors
    console.error("Unexpected error in PATCH /api/transcripts/{transcriptId}:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while updating the transcript");
  }
}

/**
 * Deletes a transcript by ID.
 * Verifies that the transcript belongs to a thread owned by the authenticated user.
 *
 * DELETE /api/transcripts/{transcriptId}
 *
 * Responses:
 * - 204: Transcript deleted successfully (no content)
 * - 400: Invalid transcriptId format
 * - 401: Authentication required
 * - 404: Transcript not found or doesn't belong to user
 * - 500: Internal server error
 */
export async function DELETE(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client, user, and transcriptId from context
    const { supabase, user } = context.locals;
    const { transcriptId } = context.params;

    if (!requireAuth(user)) {
      return createUnauthorizedResponse();
    }

    // Step 2: Validate transcriptId
    if (!transcriptId) {
      return createValidationErrorResponse("Transcript ID is required");
    }

    const transcriptIdValidation = uuidSchema.safeParse(transcriptId);
    if (!transcriptIdValidation.success) {
      return createValidationErrorResponse("Invalid transcript ID format");
    }

    // Step 3: Delete transcript using service layer
    await transcriptsService.remove(supabase, user.id, transcriptId);

    // Step 4: Return successful response (204 No Content)
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Step 5: Handle service errors
    if (error instanceof TranscriptServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 6: Handle unexpected errors
    console.error("Unexpected error in DELETE /api/transcripts/{transcriptId}:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while deleting the transcript");
  }
}
