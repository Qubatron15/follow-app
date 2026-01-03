import type { SupabaseClient } from "../../db/supabase.client";
import type { ThreadDTO, ThreadRow } from "../../types";
import { THREAD_ERRORS } from "../schemas/threads.schema";

/**
 * Custom error class for thread-related operations.
 * Provides structured error information that can be easily mapped to HTTP responses.
 */
export class ThreadServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = "ThreadServiceError";
  }
}

/**
 * Maps a database thread row to a ThreadDTO for API responses.
 * Converts snake_case database fields to camelCase API fields.
 */
function mapThreadRowToDTO(row: ThreadRow): ThreadDTO {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

/**
 * Service class for thread-related database operations.
 * Encapsulates business logic and provides clean error handling.
 */
export class ThreadsService {
  /**
   * Retrieves all threads for the specified user.
   * Returns threads ordered by creation date (newest first).
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user whose threads to retrieve
   * @returns Promise<ThreadDTO[]> - Array of thread data
   * @throws ThreadServiceError - For database errors
   */
  async getThreadsByUser(supabase: SupabaseClient, userId: string): Promise<ThreadDTO[]> {
    try {
      const { data: threads, error } = await supabase
        .from("threads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching threads:", error);
        throw new ThreadServiceError(THREAD_ERRORS.INTERNAL_SERVER_ERROR, "Failed to fetch threads", 500);
      }

      // Map database rows to DTOs
      return threads.map(mapThreadRowToDTO);
    } catch (error) {
      // Re-throw ThreadServiceError instances as-is
      if (error instanceof ThreadServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in getThreadsByUser:", error);
      throw new ThreadServiceError(
        THREAD_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while fetching threads",
        500
      );
    }
  }

  /**
   * Creates a new thread for the specified user.
   *
   * Business rules:
   * - Thread name must be unique within the user's threads (case-sensitive)
   * - User can have maximum 20 threads
   * - Thread name is already validated by Zod schema
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user creating the thread
   * @param name - Name of the thread to create
   * @returns Promise<ThreadDTO> - The created thread data
   * @throws ThreadServiceError - For business rule violations or database errors
   */
  async createThread(supabase: SupabaseClient, userId: string, name: string): Promise<ThreadDTO> {
    try {
      // Step 1: Check for duplicate thread name within user's threads
      const { data: existingThread, error: duplicateError } = await supabase
        .from("threads")
        .select("id")
        .eq("user_id", userId)
        .eq("name", name)
        .maybeSingle();

      if (duplicateError) {
        console.error("Error checking for duplicate thread:", duplicateError);
        throw new ThreadServiceError(
          THREAD_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to check for duplicate thread name",
          500
        );
      }

      if (existingThread) {
        throw new ThreadServiceError(
          THREAD_ERRORS.THREAD_NAME_DUPLICATE,
          `Thread with name "${name}" already exists`,
          409
        );
      }

      // Step 2: Check thread count limit (max 20 threads per user)
      const { count: threadCount, error: countError } = await supabase
        .from("threads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        console.error("Error counting user threads:", countError);
        throw new ThreadServiceError(THREAD_ERRORS.INTERNAL_SERVER_ERROR, "Failed to check thread count", 500);
      }

      if (threadCount !== null && threadCount >= 20) {
        throw new ThreadServiceError(THREAD_ERRORS.THREAD_LIMIT_REACHED, "Maximum number of threads (20) reached", 429);
      }

      // Step 3: Create the new thread
      const { data: newThread, error: insertError } = await supabase
        .from("threads")
        .insert({
          user_id: userId,
          name: name,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating thread:", insertError);

        // Handle specific database constraint violations
        if (insertError.code === "23505") {
          // Unique constraint violation - race condition with duplicate check
          throw new ThreadServiceError(
            THREAD_ERRORS.THREAD_NAME_DUPLICATE,
            `Thread with name "${name}" already exists`,
            409
          );
        }

        throw new ThreadServiceError(THREAD_ERRORS.INTERNAL_SERVER_ERROR, "Failed to create thread", 500);
      }

      if (!newThread) {
        throw new ThreadServiceError(
          THREAD_ERRORS.INTERNAL_SERVER_ERROR,
          "Thread was not returned after creation",
          500
        );
      }

      // Step 4: Return the created thread as DTO
      return mapThreadRowToDTO(newThread);
    } catch (error) {
      // Re-throw ThreadServiceError instances as-is
      if (error instanceof ThreadServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in createThread:", error);
      throw new ThreadServiceError(
        THREAD_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while creating the thread",
        500
      );
    }
  }

  /**
   * Updates an existing thread's name for the specified user.
   *
   * Business rules:
   * - Thread must exist and belong to the user
   * - New thread name must be unique within the user's threads (case-sensitive)
   * - Thread name is already validated by Zod schema
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user who owns the thread
   * @param threadId - ID of the thread to update
   * @param name - New name for the thread
   * @returns Promise<ThreadDTO> - The updated thread data
   * @throws ThreadServiceError - For business rule violations or database errors
   */
  async updateThread(supabase: SupabaseClient, userId: string, threadId: string, name: string): Promise<ThreadDTO> {
    try {
      // Step 1: Check if thread exists and belongs to user
      const { data: existingThread, error: fetchError } = await supabase
        .from("threads")
        .select("id")
        .eq("id", threadId)
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching thread:", fetchError);
        throw new ThreadServiceError(THREAD_ERRORS.INTERNAL_SERVER_ERROR, "Failed to fetch thread", 500);
      }

      if (!existingThread) {
        throw new ThreadServiceError(THREAD_ERRORS.THREAD_NOT_FOUND, `Thread with id "${threadId}" not found`, 404);
      }

      // Step 2: Check for duplicate thread name within user's threads (excluding current thread)
      const { data: duplicateThread, error: duplicateError } = await supabase
        .from("threads")
        .select("id")
        .eq("user_id", userId)
        .eq("name", name)
        .neq("id", threadId)
        .maybeSingle();

      if (duplicateError) {
        console.error("Error checking for duplicate thread:", duplicateError);
        throw new ThreadServiceError(
          THREAD_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to check for duplicate thread name",
          500
        );
      }

      if (duplicateThread) {
        throw new ThreadServiceError(
          THREAD_ERRORS.THREAD_NAME_DUPLICATE,
          `Thread with name "${name}" already exists`,
          409
        );
      }

      // Step 3: Update the thread
      const { data: updatedThread, error: updateError } = await supabase
        .from("threads")
        .update({ name })
        .eq("id", threadId)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating thread:", updateError);

        // Handle specific database constraint violations
        if (updateError.code === "23505") {
          // Unique constraint violation - race condition with duplicate check
          throw new ThreadServiceError(
            THREAD_ERRORS.THREAD_NAME_DUPLICATE,
            `Thread with name "${name}" already exists`,
            409
          );
        }

        throw new ThreadServiceError(THREAD_ERRORS.INTERNAL_SERVER_ERROR, "Failed to update thread", 500);
      }

      if (!updatedThread) {
        throw new ThreadServiceError(THREAD_ERRORS.INTERNAL_SERVER_ERROR, "Thread was not returned after update", 500);
      }

      // Step 4: Return the updated thread as DTO
      return mapThreadRowToDTO(updatedThread);
    } catch (error) {
      // Re-throw ThreadServiceError instances as-is
      if (error instanceof ThreadServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in updateThread:", error);
      throw new ThreadServiceError(
        THREAD_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while updating the thread",
        500
      );
    }
  }

  /**
   * Deletes a thread and all its associated data (transcripts, action points).
   * This is a hard delete - the data cannot be recovered.
   *
   * Business rules:
   * - Thread must exist and belong to the user
   * - All associated transcripts and action points will be cascade deleted
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user who owns the thread
   * @param threadId - ID of the thread to delete
   * @returns Promise<void>
   * @throws ThreadServiceError - For business rule violations or database errors
   */
  async deleteThread(supabase: SupabaseClient, userId: string, threadId: string): Promise<void> {
    try {
      // Step 1: Delete the thread (cascade will handle related records)
      const { error: deleteError } = await supabase.from("threads").delete().eq("id", threadId).eq("user_id", userId);

      if (deleteError) {
        console.error("Error deleting thread:", deleteError);
        throw new ThreadServiceError(THREAD_ERRORS.INTERNAL_SERVER_ERROR, "Failed to delete thread", 500);
      }

      // Note: We don't check if the thread existed because:
      // - DELETE is idempotent in REST
      // - If thread doesn't exist or doesn't belong to user, nothing happens
      // - This is acceptable behavior for DELETE operations
    } catch (error) {
      // Re-throw ThreadServiceError instances as-is
      if (error instanceof ThreadServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in deleteThread:", error);
      throw new ThreadServiceError(
        THREAD_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while deleting the thread",
        500
      );
    }
  }
}

/**
 * Singleton instance of the ThreadsService.
 * Export this instance to use throughout the application.
 */
export const threadsService = new ThreadsService();
