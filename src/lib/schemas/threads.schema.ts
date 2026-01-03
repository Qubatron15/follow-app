import { z } from "zod";

/**
 * Error codes for thread validation and operations.
 * These codes are used consistently across the application for error handling.
 */
export const THREAD_ERRORS = {
  THREAD_NAME_INVALID: "THREAD_NAME_INVALID",
  THREAD_NAME_DUPLICATE: "THREAD_NAME_DUPLICATE",
  THREAD_LIMIT_REACHED: "THREAD_LIMIT_REACHED",
  THREAD_NOT_FOUND: "THREAD_NOT_FOUND",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

/**
 * Zod schema for validating thread creation requests.
 * Validates that the thread name is:
 * - Non-empty after trimming whitespace
 * - Maximum 20 characters long
 *
 * The schema automatically trims whitespace to prevent XSS and ensure clean data.
 */
export const createThreadSchema = z.object({
  name: z.string().trim().min(1, THREAD_ERRORS.THREAD_NAME_INVALID).max(20, THREAD_ERRORS.THREAD_NAME_INVALID),
});

/**
 * Type inference for the validated thread creation data.
 */
export type CreateThreadInput = z.infer<typeof createThreadSchema>;

/**
 * Zod schema for validating thread update requests.
 * Validates that the thread name is:
 * - Non-empty after trimming whitespace
 * - Maximum 20 characters long
 *
 * The schema automatically trims whitespace to prevent XSS and ensure clean data.
 */
export const updateThreadSchema = z.object({
  name: z.string().trim().min(1, THREAD_ERRORS.THREAD_NAME_INVALID).max(20, THREAD_ERRORS.THREAD_NAME_INVALID),
});

/**
 * Type inference for the validated thread update data.
 */
export type UpdateThreadInput = z.infer<typeof updateThreadSchema>;
