import type { APIContext } from "astro";
import { requireAuth, createUnauthorizedResponse } from "../../../../../lib/auth-helpers";
import {
  createActionPointSchema,
  uuidSchema,
  booleanStringSchema,
} from "../../../../../lib/schemas/action-points.schema";
import { actionPointsService, ActionPointServiceError } from "../../../../../lib/services/action-points.service";
import {
  mapServiceErrorToHttpResponse,
  createValidationErrorResponse,
  createInternalServerErrorResponse,
} from "../../../../../lib/errors";

// Disable prerendering for this API route to enable server-side processing
export const prerender = false;

/**
 * Retrieves all action points for a specific thread.
 * Optionally filters by completion status.
 *
 * GET /api/threads/{threadId}/action-points?completed=true|false
 *
 * Query parameters:
 * - completed: Optional boolean filter (true|false)
 *
 * Responses:
 * - 200: List of action points returned successfully
 * - 400: Invalid input data (invalid UUID or boolean format)
 * - 404: Thread not found or doesn't belong to user
 * - 500: Internal server error
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client, user, and threadId from context
    const { supabase, user } = context.locals;
    const { threadId } = context.params;

    if (!requireAuth(user)) {
      return createUnauthorizedResponse();
    }

    // Step 2: Validate threadId parameter
    if (!threadId) {
      return createValidationErrorResponse("Thread ID is required");
    }

    const threadIdValidation = uuidSchema.safeParse(threadId);
    if (!threadIdValidation.success) {
      return createValidationErrorResponse("Invalid thread ID format");
    }

    // Step 3: Parse and validate optional 'completed' query parameter
    const url = new URL(context.request.url);
    const completedParam = url.searchParams.get("completed");
    let completed: boolean | undefined = undefined;

    if (completedParam !== null) {
      const completedValidation = booleanStringSchema.safeParse(completedParam);
      if (!completedValidation.success) {
        return createValidationErrorResponse("Invalid 'completed' parameter. Must be 'true' or 'false'");
      }
      completed = completedValidation.data;
    }

    // Step 4: Fetch action points using service layer
    const actionPoints = await actionPointsService.list(supabase, user.id, threadId, completed);

    // Step 5: Return successful response
    const successResponse = {
      data: actionPoints,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Step 6: Handle service errors
    if (error instanceof ActionPointServiceError) {
      return mapServiceErrorToHttpResponse(error);
    }

    // Step 7: Handle unexpected errors
    console.error("Unexpected error in GET /api/threads/{threadId}/action-points:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while fetching action points");
  }
}

/**
 * Creates a new action point for a specific thread.
 *
 * POST /api/threads/{threadId}/action-points
 *
 * Request body:
 * {
 *   "title": "Action point title",  // string, 1-255 characters
 *   "isCompleted": false             // boolean, optional, defaults to false
 * }
 *
 * Responses:
 * - 201: Action point created successfully
 * - 400: Invalid input data
 * - 404: Thread not found or doesn't belong to user
 * - 500: Internal server error
 */
export async function POST(context: APIContext): Promise<Response> {
  try {
    // Step 1: Extract Supabase client, user, and threadId from context
    const { supabase, user } = context.locals;
    const { threadId } = context.params;

    if (!requireAuth(user)) {
      return createUnauthorizedResponse();
    }

    // Step 2: Validate threadId parameter
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
    const validationResult = createActionPointSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return createValidationErrorResponse("Action point title must be between 1 and 255 characters");
    }

    // Step 5: Create action point using service layer
    const actionPointData = await actionPointsService.create(
      supabase,
      user.id,
      threadId,
      validationResult.data.title,
      validationResult.data.isCompleted
    );

    // Step 6: Return successful response
    const successResponse = {
      data: actionPointData,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 201,
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
    console.error("Unexpected error in POST /api/threads/{threadId}/action-points:", error);
    return createInternalServerErrorResponse("An unexpected error occurred while creating the action point");
  }
}
