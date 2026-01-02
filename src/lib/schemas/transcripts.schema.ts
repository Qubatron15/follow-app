import { z } from "zod";

/**
 * Error codes for transcript validation and operations.
 * These codes are used consistently across the application for error handling.
 */
export const TRANSCRIPT_ERRORS = {
  TRANSCRIPT_CONTENT_INVALID: "TRANSCRIPT_CONTENT_INVALID",
  TRANSCRIPT_NOT_FOUND: "TRANSCRIPT_NOT_FOUND",
  THREAD_NOT_FOUND: "THREAD_NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

/**
 * Zod schema for validating UUID parameters.
 * Ensures that IDs are valid UUIDs.
 */
export const uuidSchema = z.string().uuid({
  message: "Invalid UUID format",
});

/**
 * Zod schema for validating transcript creation requests.
 * Validates that the content is:
 * - Non-empty after trimming whitespace
 * - Maximum 30,000 characters long (protection against DOS attacks)
 *
 * The schema automatically trims whitespace to prevent XSS and ensure clean data.
 */
export const createTranscriptSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, TRANSCRIPT_ERRORS.TRANSCRIPT_CONTENT_INVALID)
    .max(30_000, TRANSCRIPT_ERRORS.TRANSCRIPT_CONTENT_INVALID),
});

/**
 * Type inference for the validated transcript creation data.
 */
export type CreateTranscriptInput = z.infer<typeof createTranscriptSchema>;

/**
 * Zod schema for validating transcript update requests.
 * Validates that the content is:
 * - Non-empty after trimming whitespace
 * - Maximum 30,000 characters long
 *
 * The schema automatically trims whitespace to prevent XSS and ensure clean data.
 */
export const updateTranscriptSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, TRANSCRIPT_ERRORS.TRANSCRIPT_CONTENT_INVALID)
    .max(30_000, TRANSCRIPT_ERRORS.TRANSCRIPT_CONTENT_INVALID),
});

/**
 * Type inference for the validated transcript update data.
 */
export type UpdateTranscriptInput = z.infer<typeof updateTranscriptSchema>;
