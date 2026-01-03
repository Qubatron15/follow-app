import type { SupabaseClient } from "../../db/supabase.client";
import type { TranscriptDTO, TranscriptRow } from "../../types";
import { TRANSCRIPT_ERRORS } from "../schemas/transcripts.schema";

/**
 * Custom error class for transcript-related operations.
 * Provides structured error information that can be easily mapped to HTTP responses.
 */
export class TranscriptServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = "TranscriptServiceError";
  }
}

/**
 * Maps a database transcript row to a TranscriptDTO for API responses.
 * Converts snake_case database fields to camelCase API fields.
 */
function mapTranscriptRowToDTO(row: TranscriptRow): TranscriptDTO {
  return {
    id: row.id,
    threadId: row.thread_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

/**
 * Service class for transcript-related database operations.
 * Encapsulates business logic and provides clean error handling.
 */
export class TranscriptsService {
  /**
   * Retrieves all transcripts for a specific thread.
   * Verifies thread ownership before returning transcripts.
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user requesting transcripts
   * @param threadId - ID of the thread to retrieve transcripts from
   * @returns Promise<TranscriptDTO[]> - Array of transcript data
   * @throws TranscriptServiceError - For ownership violations or database errors
   */
  async list(supabase: SupabaseClient, userId: string, threadId: string): Promise<TranscriptDTO[]> {
    try {
      // Step 1: Verify thread exists and belongs to user
      const { data: thread, error: threadError } = await supabase
        .from("threads")
        .select("id")
        .eq("id", threadId)
        .eq("user_id", userId)
        .maybeSingle();

      if (threadError) {
        console.error("Error verifying thread ownership:", threadError);
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to verify thread ownership",
          500
        );
      }

      if (!thread) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.THREAD_NOT_FOUND,
          `Thread with id "${threadId}" not found`,
          404
        );
      }

      // Step 2: Fetch all transcripts
      const { data: transcripts, error: fetchError } = await supabase
        .from("transcripts")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching transcripts:", fetchError);
        throw new TranscriptServiceError(TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR, "Failed to fetch transcripts", 500);
      }

      // Step 3: Return transcripts as DTOs
      return transcripts.map(mapTranscriptRowToDTO);
    } catch (error) {
      // Re-throw TranscriptServiceError instances as-is
      if (error instanceof TranscriptServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in list:", error);
      throw new TranscriptServiceError(
        TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while fetching transcripts",
        500
      );
    }
  }

  /**
   * Creates a new transcript for a specific thread.
   * Verifies thread ownership before creating the transcript.
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user creating the transcript
   * @param threadId - ID of the thread to add transcript to
   * @param content - Content of the transcript
   * @returns Promise<TranscriptDTO> - The created transcript data
   * @throws TranscriptServiceError - For ownership violations or database errors
   */
  async create(supabase: SupabaseClient, userId: string, threadId: string, content: string): Promise<TranscriptDTO> {
    try {
      // Step 1: Verify thread exists and belongs to user
      const { data: thread, error: threadError } = await supabase
        .from("threads")
        .select("id")
        .eq("id", threadId)
        .eq("user_id", userId)
        .maybeSingle();

      if (threadError) {
        console.error("Error verifying thread ownership:", threadError);
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to verify thread ownership",
          500
        );
      }

      if (!thread) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.THREAD_NOT_FOUND,
          `Thread with id "${threadId}" not found`,
          404
        );
      }

      // Step 2: Create the new transcript
      const { data: newTranscript, error: insertError } = await supabase
        .from("transcripts")
        .insert({
          thread_id: threadId,
          content: content,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating transcript:", insertError);
        throw new TranscriptServiceError(TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR, "Failed to create transcript", 500);
      }

      if (!newTranscript) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
          "Transcript was not returned after creation",
          500
        );
      }

      // Step 3: Return the created transcript as DTO
      return mapTranscriptRowToDTO(newTranscript);
    } catch (error) {
      // Re-throw TranscriptServiceError instances as-is
      if (error instanceof TranscriptServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in create:", error);
      throw new TranscriptServiceError(
        TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while creating the transcript",
        500
      );
    }
  }

  /**
   * Retrieves a single transcript by ID.
   * Verifies that the transcript belongs to a thread owned by the user.
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user requesting the transcript
   * @param transcriptId - ID of the transcript to retrieve
   * @returns Promise<TranscriptDTO> - The transcript data
   * @throws TranscriptServiceError - For ownership violations or database errors
   */
  async get(supabase: SupabaseClient, userId: string, transcriptId: string): Promise<TranscriptDTO> {
    try {
      // Step 1: Fetch transcript with thread ownership verification
      const { data: transcript, error: fetchError } = await supabase
        .from("transcripts")
        .select("*, threads!inner(user_id)")
        .eq("id", transcriptId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching transcript:", fetchError);
        throw new TranscriptServiceError(TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR, "Failed to fetch transcript", 500);
      }

      if (!transcript) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.TRANSCRIPT_NOT_FOUND,
          `Transcript with id "${transcriptId}" not found`,
          404
        );
      }

      // Step 2: Verify thread ownership (BOLA protection)
      const threadUserId = (transcript.threads as any).user_id;
      if (threadUserId !== userId) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.TRANSCRIPT_NOT_FOUND,
          `Transcript with id "${transcriptId}" not found`,
          404
        );
      }

      // Step 3: Return the transcript as DTO
      return mapTranscriptRowToDTO(transcript);
    } catch (error) {
      // Re-throw TranscriptServiceError instances as-is
      if (error instanceof TranscriptServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in get:", error);
      throw new TranscriptServiceError(
        TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while fetching the transcript",
        500
      );
    }
  }

  /**
   * Updates an existing transcript's content.
   * Verifies that the transcript belongs to a thread owned by the user.
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user updating the transcript
   * @param transcriptId - ID of the transcript to update
   * @param content - New content for the transcript
   * @returns Promise<TranscriptDTO> - The updated transcript data
   * @throws TranscriptServiceError - For ownership violations or database errors
   */
  async update(
    supabase: SupabaseClient,
    userId: string,
    transcriptId: string,
    content: string
  ): Promise<TranscriptDTO> {
    try {
      // Step 1: Verify transcript exists and belongs to user's thread
      const { data: transcript, error: fetchError } = await supabase
        .from("transcripts")
        .select("id, threads!inner(user_id)")
        .eq("id", transcriptId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error verifying transcript ownership:", fetchError);
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to verify transcript ownership",
          500
        );
      }

      if (!transcript) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.TRANSCRIPT_NOT_FOUND,
          `Transcript with id "${transcriptId}" not found`,
          404
        );
      }

      // Step 2: Verify thread ownership (BOLA protection)
      const threadUserId = (transcript.threads as any).user_id;
      if (threadUserId !== userId) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.TRANSCRIPT_NOT_FOUND,
          `Transcript with id "${transcriptId}" not found`,
          404
        );
      }

      // Step 3: Update the transcript
      const { data: updatedTranscript, error: updateError } = await supabase
        .from("transcripts")
        .update({ content })
        .eq("id", transcriptId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating transcript:", updateError);
        throw new TranscriptServiceError(TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR, "Failed to update transcript", 500);
      }

      if (!updatedTranscript) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
          "Transcript was not returned after update",
          500
        );
      }

      // Step 4: Return the updated transcript as DTO
      return mapTranscriptRowToDTO(updatedTranscript);
    } catch (error) {
      // Re-throw TranscriptServiceError instances as-is
      if (error instanceof TranscriptServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in update:", error);
      throw new TranscriptServiceError(
        TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while updating the transcript",
        500
      );
    }
  }

  /**
   * Deletes a transcript by ID.
   * Verifies that the transcript belongs to a thread owned by the user.
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the user deleting the transcript
   * @param transcriptId - ID of the transcript to delete
   * @returns Promise<void>
   * @throws TranscriptServiceError - For ownership violations or database errors
   */
  async remove(supabase: SupabaseClient, userId: string, transcriptId: string): Promise<void> {
    try {
      // Step 1: Verify transcript exists and belongs to user's thread
      const { data: transcript, error: fetchError } = await supabase
        .from("transcripts")
        .select("id, threads!inner(user_id)")
        .eq("id", transcriptId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error verifying transcript ownership:", fetchError);
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
          "Failed to verify transcript ownership",
          500
        );
      }

      if (!transcript) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.TRANSCRIPT_NOT_FOUND,
          `Transcript with id "${transcriptId}" not found`,
          404
        );
      }

      // Step 2: Verify thread ownership (BOLA protection)
      const threadUserId = (transcript.threads as any).user_id;
      if (threadUserId !== userId) {
        throw new TranscriptServiceError(
          TRANSCRIPT_ERRORS.TRANSCRIPT_NOT_FOUND,
          `Transcript with id "${transcriptId}" not found`,
          404
        );
      }

      // Step 3: Delete the transcript
      const { error: deleteError } = await supabase.from("transcripts").delete().eq("id", transcriptId);

      if (deleteError) {
        console.error("Error deleting transcript:", deleteError);
        throw new TranscriptServiceError(TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR, "Failed to delete transcript", 500);
      }
    } catch (error) {
      // Re-throw TranscriptServiceError instances as-is
      if (error instanceof TranscriptServiceError) {
        throw error;
      }

      // Handle unexpected errors
      console.error("Unexpected error in remove:", error);
      throw new TranscriptServiceError(
        TRANSCRIPT_ERRORS.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred while deleting the transcript",
        500
      );
    }
  }
}

/**
 * Singleton instance of the TranscriptsService.
 * Export this instance to use throughout the application.
 */
export const transcriptsService = new TranscriptsService();
