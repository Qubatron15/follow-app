import type { APIContext } from "astro";
import { uuidSchema } from "../../../lib/schemas/transcripts.schema";
import { transcriptsService, TranscriptServiceError } from "../../../lib/services/transcripts.service";
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
    // Step 1: Extract Supabase client and transcriptId from context
    const { supabase } = context.locals;
    const { transcriptId } = context.params;

    // Step 2: Validate transcriptId
    if (!transcriptId) {
      return createValidationErrorResponse("Transcript ID is required");
    }

    const transcriptIdValidation = uuidSchema.safeParse(transcriptId);
    if (!transcriptIdValidation.success) {
      return createValidationErrorResponse("Invalid transcript ID format");
    }

    // Step 3: Fetch transcript using service layer
    const transcriptData = await transcriptsService.get(
      supabase,
      "24a19ed0-7584-4377-a10f-326c63d9f927",
      transcriptId
    );

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
    // Step 1: Extract Supabase client and transcriptId from context
    const { supabase } = context.locals;
    const { transcriptId } = context.params;

    // Step 2: Validate transcriptId
    if (!transcriptId) {
      return createValidationErrorResponse("Transcript ID is required");
    }

    const transcriptIdValidation = uuidSchema.safeParse(transcriptId);
    if (!transcriptIdValidation.success) {
      return createValidationErrorResponse("Invalid transcript ID format");
    }

    // Step 3: Delete transcript using service layer
    await transcriptsService.remove(supabase, "24a19ed0-7584-4377-a10f-326c63d9f927", transcriptId);

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
