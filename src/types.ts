import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

/**
 * Helper aliases for strongly-typed access to DB rows.
 * Keeping these aliases local to this file ensures compile-time coupling
 * between DTOs/command models and the underlying database schema.
 */
export type ThreadRow = Tables<"threads">;
export type TranscriptRow = Tables<"transcripts">;
export type ActionPointRow = Tables<"action_points">;

/**
 * Thread data returned by API responses.
 * Mirrors `threads` table row but uses camel-cased property names to conform
 * to our JSON style guide. Optional aggregate counts are included only where
 * endpoints enrich the payload (e.g. GET /api/threads/{id}).
 */
export interface ThreadDTO {
  id: ThreadRow["id"];
  userId: ThreadRow["user_id"];
  name: ThreadRow["name"];
  createdAt: ThreadRow["created_at"];
}

/**
 * Body schema for POST /api/threads.
 * Reuses DB insert type so validation stays in sync with DB constraints.
 */
export type CreateThreadCommand = Pick<TablesInsert<"threads">, "name">;

/**
 * Body schema for PATCH /api/threads/{id}.
 * Uses Partial as only the changed fields need to be present.
 */
export type UpdateThreadCommand = Partial<Pick<TablesUpdate<"threads">, "name">>;

/**
 * Transcript DTO reflecting `transcripts` table rows.
 */
export interface TranscriptDTO {
  id: TranscriptRow["id"];
  threadId: TranscriptRow["thread_id"];
  content: TranscriptRow["content"];
  createdAt: TranscriptRow["created_at"];
}

/**
 * Body schema for POST /api/threads/{threadId}/transcripts.
 */
export type CreateTranscriptCommand = Pick<TablesInsert<"transcripts">, "content">;

/**
 * Action Point DTO – a single actionable item.
 */
export interface ActionPointDTO {
  id: ActionPointRow["id"];
  threadId: ActionPointRow["thread_id"];
  title: ActionPointRow["title"];
  isCompleted: ActionPointRow["is_completed"];
  createdAt: ActionPointRow["created_at"];
}

/**
 * Body schema for POST /api/threads/{threadId}/action-points.
 */
export type CreateActionPointCommand = Pick<TablesInsert<"action_points">, "title" | "is_completed">;

/**
 * Body schema for PATCH /api/action-points/{id}.
 */
export type UpdateActionPointCommand = Partial<Pick<TablesUpdate<"action_points">, "title" | "is_completed">>;

/**
 * Standard error response format for API endpoints.
 * Used consistently across all error scenarios to provide structured error information.
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
