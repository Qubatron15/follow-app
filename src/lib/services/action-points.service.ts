import type { SupabaseClient } from "../../db/supabase.client";
import type { ActionPointDTO, ActionPointRow } from "../../types";
import { ACTION_POINT_ERRORS } from "../schemas/action-points.schema";

/**
 * Custom error class for action point-related operations.
 * Provides structured error information that can be easily mapped to HTTP responses.
 */
export class ActionPointServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = "ActionPointServiceError";
  }
}

/**
 * Maps a database action point row to an ActionPointDTO for API responses.
 * Converts snake_case database fields to camelCase API fields.
 */
function mapActionPointRowToDTO(row: ActionPointRow): ActionPointDTO {
  return {
    id: row.id,
    threadId: row.thread_id,
    title: row.title,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
  };
}

/**
 * Service class for action point-related database operations.
 * Encapsulates business logic and provides clean error handling with BOLA protection.
 */
export class ActionPointsService {
  /**
   * Retrieves all action points for a specific thread.
   * Optionally filters by completion status.
   * Verifies thread ownership before returning action points.
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user requesting action points
   * @param threadId - ID of the thread to retrieve action points from
   * @param completed - Optional filter for completion status
   * @returns Promise<ActionPointDTO[]> - Array of action point data
   * @throws ActionPointServiceError - For ownership violations or database errors
   */
  async list(
    supabase: SupabaseClient,
    userId: string,
    threadId: string,
    completed?: boolean
  ): Promise<ActionPointDTO[]> {
    try {
      // Step 1: Verify thread exists and belongs to user (BOLA protection)
      const { data: thread, error: threadError } = await supabase
        .from("threads")
        .select("id")
        .eq("id", threadId)
        .eq("user_id", userId)
        .maybeSingle();

      if (threadError) {
        console.error("Error verifying thread ownership:", threadError);
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to verify thread ownership",
          500
        );
      }

      if (!thread) {
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.THREAD_NOT_FOUND,
          `Thread with id "${threadId}" not found`,
          404
        );
      }

      // Step 2: Build query for action points
      let query = supabase
        .from("action_points")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: false });

      // Apply completion filter if provided
      if (completed !== undefined) {
        query = query.eq("is_completed", completed);
      }

      // Step 3: Fetch action points
      const { data: actionPoints, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching action points:", fetchError);
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to fetch action points",
          500
        );
      }

      // Step 4: Return action points as DTOs
      return actionPoints.map(mapActionPointRowToDTO);
    } catch (error) {
      // Re-throw ActionPointServiceError instances as-is
      if (error instanceof ActionPointServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in list:", error);
      throw new ActionPointServiceError(
        ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while fetching action points",
        500
      );
    }
  }

  /**
   * Creates a new action point for a specific thread.
   * Verifies thread ownership before creating the action point.
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user creating the action point
   * @param threadId - ID of the thread to add action point to
   * @param title - Title of the action point
   * @param isCompleted - Completion status (defaults to false)
   * @returns Promise<ActionPointDTO> - The created action point data
   * @throws ActionPointServiceError - For ownership violations or database errors
   */
  async create(
    supabase: SupabaseClient,
    userId: string,
    threadId: string,
    title: string,
    isCompleted = false
  ): Promise<ActionPointDTO> {
    try {
      // Step 1: Verify thread exists and belongs to user (BOLA protection)
      const { data: thread, error: threadError } = await supabase
        .from("threads")
        .select("id")
        .eq("id", threadId)
        .eq("user_id", userId)
        .maybeSingle();

      if (threadError) {
        console.error("Error verifying thread ownership:", threadError);
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to verify thread ownership",
          500
        );
      }

      if (!thread) {
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.THREAD_NOT_FOUND,
          `Thread with id "${threadId}" not found`,
          404
        );
      }

      // Step 2: Create the new action point
      const { data: newActionPoint, error: insertError } = await supabase
        .from("action_points")
        .insert({
          thread_id: threadId,
          title: title,
          is_completed: isCompleted,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating action point:", insertError);
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to create action point",
          500
        );
      }

      if (!newActionPoint) {
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Action point was not returned after creation",
          500
        );
      }

      // Step 3: Return the created action point as DTO
      return mapActionPointRowToDTO(newActionPoint);
    } catch (error) {
      // Re-throw ActionPointServiceError instances as-is
      if (error instanceof ActionPointServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in create:", error);
      throw new ActionPointServiceError(
        ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while creating the action point",
        500
      );
    }
  }

  /**
   * Updates an existing action point's title and/or completion status.
   * Verifies that the action point belongs to a thread owned by the user.
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user updating the action point
   * @param apId - ID of the action point to update
   * @param updates - Partial updates (title and/or isCompleted)
   * @returns Promise<ActionPointDTO> - The updated action point data
   * @throws ActionPointServiceError - For ownership violations or database errors
   */
  async update(
    supabase: SupabaseClient,
    userId: string,
    apId: string,
    updates: { title?: string; isCompleted?: boolean }
  ): Promise<ActionPointDTO> {
    try {
      // Step 1: Verify action point exists and belongs to user's thread (BOLA protection)
      const { data: actionPoint, error: fetchError } = await supabase
        .from("action_points")
        .select("id, threads!inner(user_id)")
        .eq("id", apId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error verifying action point ownership:", fetchError);
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to verify action point ownership",
          500
        );
      }

      if (!actionPoint) {
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.ACTION_POINT_NOT_FOUND,
          `Action point with id "${apId}" not found`,
          404
        );
      }

      // Step 2: Verify thread ownership (BOLA protection)
      const threadUserId = actionPoint.threads.user_id;
      if (threadUserId !== userId) {
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.ACTION_POINT_NOT_FOUND,
          `Action point with id "${apId}" not found`,
          404
        );
      }

      // Step 3: Build update object with snake_case field names
      const updateData: { title?: string; is_completed?: boolean } = {};
      if (updates.title !== undefined) {
        updateData.title = updates.title;
      }
      if (updates.isCompleted !== undefined) {
        updateData.is_completed = updates.isCompleted;
      }

      // Step 4: Update the action point
      const { data: updatedActionPoint, error: updateError } = await supabase
        .from("action_points")
        .update(updateData)
        .eq("id", apId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating action point:", updateError);
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to update action point",
          500
        );
      }

      if (!updatedActionPoint) {
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Action point was not returned after update",
          500
        );
      }

      // Step 5: Return the updated action point as DTO
      return mapActionPointRowToDTO(updatedActionPoint);
    } catch (error) {
      // Re-throw ActionPointServiceError instances as-is
      if (error instanceof ActionPointServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in update:", error);
      throw new ActionPointServiceError(
        ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while updating the action point",
        500
      );
    }
  }

  /**
   * Deletes an action point by ID.
   * Verifies that the action point belongs to a thread owned by the user.
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user deleting the action point
   * @param apId - ID of the action point to delete
   * @returns Promise<void>
   * @throws ActionPointServiceError - For ownership violations or database errors
   */
  async remove(supabase: SupabaseClient, userId: string, apId: string): Promise<void> {
    try {
      // Step 1: Verify action point exists and belongs to user's thread (BOLA protection)
      const { data: actionPoint, error: fetchError } = await supabase
        .from("action_points")
        .select("id, threads!inner(user_id)")
        .eq("id", apId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error verifying action point ownership:", fetchError);
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to verify action point ownership",
          500
        );
      }

      if (!actionPoint) {
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.ACTION_POINT_NOT_FOUND,
          `Action point with id "${apId}" not found`,
          404
        );
      }

      // Step 2: Verify thread ownership (BOLA protection)
      const threadUserId = actionPoint.threads.user_id;
      if (threadUserId !== userId) {
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.ACTION_POINT_NOT_FOUND,
          `Action point with id "${apId}" not found`,
          404
        );
      }

      // Step 3: Delete the action point
      const { error: deleteError } = await supabase.from("action_points").delete().eq("id", apId);

      if (deleteError) {
        console.error("Error deleting action point:", deleteError);
        throw new ActionPointServiceError(
          ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to delete action point",
          500
        );
      }
    } catch (error) {
      // Re-throw ActionPointServiceError instances as-is
      if (error instanceof ActionPointServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in remove:", error);
      throw new ActionPointServiceError(
        ACTION_POINT_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while deleting the action point",
        500
      );
    }
  }
}

/**
 * Singleton instance of the ActionPointsService.
 * Export this instance to use throughout the application.
 */
export const actionPointsService = new ActionPointsService();
