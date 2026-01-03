import type { APIContext } from "astro";
import { requireAuth, createUnauthorizedResponse } from "../../../lib/auth-helpers";
import { updateActionPointSchema, uuidSchema } from "../../../lib/schemas/action-points.schema";
import { actionPointsService, ActionPointServiceError } from "../../../lib/services/action-points.service";
import {
  mapServiceErrorToHttpResponse,
  createValidationErrorResponse,
  createInternalServerErrorResponse,
} from "../../../lib/errors";

// Disable prerendering for this API route to enable server-side processing
export const prerender = false;

/**
 * Updates an existing action point's title and/or completion status.
 *
 * PATCH /api/action-points/{apId}
 *
 * Request body (at least one field required):
 * {
 *   "title": "Updated title",       // string, 1-255 characters, optional
 *   "isCompleted": true              // boolean, optional
 * }
 *
 * Responses:
 * - 200: Action point updated successfully
 * - 400: Invalid input data
 * - 404: Action point not found or doesn't belong to user
 * - 500: Internal server error
 */
export async function PATCH(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client, user, and apId from context
    const { supabase, user } = context.locals;
    const { apId } = context.params;

    if (!requireAuth(user)) {
      return createUnauthorizedResponse();
    }

    // Step 2: Validate apId parameter
    if (!apId) {
      return createValidationErrorResponse("Action point ID is required");
    }

    const apIdValidation = uuidSchema.safeParse(apId);
    if (!apIdValidation.success) {
      return createValidationErrorResponse("Invalid action point ID format");
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
    const validationResult = updateActionPointSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return createValidationErrorResponse(
        "At least one field (title or isCompleted) must be provided, and title must be between 1 and 255 characters if provided"
      );
    }

    // Step 5: Update action point using service layer
    const actionPointData = await actionPointsService.update(supabase, user.id, apId, validationResult.data);

    // Step 6: Return successful response
    const successResponse = {
      data: actionPointData,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Step 7: Handle service errors
    if (error instanceof ActionPointServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 8: Handle unexpected errors
    console.error("Unexpected error in PATCH /api/action-points/{apId}:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while updating the action point");
  }
}

/**
 * Deletes an action point by ID.
 * This is a hard delete - the data cannot be recovered.
 *
 * DELETE /api/action-points/{apId}
 *
 * Responses:
 * - 204: Action point deleted successfully (no content)
 * - 400: Invalid action point ID format
 * - 404: Action point not found or doesn't belong to user
 * - 500: Internal server error
 */
export async function DELETE(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client, user, and apId from context
    const { supabase, user } = context.locals;
    const { apId } = context.params;

    if (!requireAuth(user)) {
      return createUnauthorizedResponse();
    }

    // Step 2: Validate apId parameter
    if (!apId) {
      return createValidationErrorResponse("Action point ID is required");
    }

    const apIdValidation = uuidSchema.safeParse(apId);
    if (!apIdValidation.success) {
      return createValidationErrorResponse("Invalid action point ID format");
    }

    // Step 3: Delete action point using service layer
    await actionPointsService.remove(supabase, user.id, apId);

    // Step 4: Return successful response (204 No Content)
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Step 5: Handle service errors
    if (error instanceof ActionPointServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 6: Handle unexpected errors
    console.error("Unexpected error in DELETE /api/action-points/{apId}:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while deleting the action point");
  }
}
