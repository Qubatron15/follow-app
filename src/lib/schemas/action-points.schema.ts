import { z } from "zod";

/**
 * Error codes for action point validation and operations.
 * These codes are used consistently across the application for error handling.
 */
export const ACTION_POINT_ERRORS = {
  ACTION_POINT_TITLE_INVALID: "ACTION_POINT_TITLE_INVALID",
  ACTION_POINT_NOT_FOUND: "ACTION_POINT_NOT_FOUND",
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
 * Zod schema for validating boolean query parameters.
 * Converts string "true"/"false" to boolean values.
 */
export const booleanStringSchema = z
  .string()
  .transform((val) => val === "true")
  .pipe(z.boolean());

/**
 * Zod schema for validating action point creation requests.
 * Validates that:
 * - title is non-empty after trimming whitespace
 * - title is maximum 255 characters long
 * - isCompleted is optional and defaults to false
 *
 * The schema automatically trims whitespace to prevent XSS and ensure clean data.
 */
export const createActionPointSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, ACTION_POINT_ERRORS.ACTION_POINT_TITLE_INVALID)
    .max(255, ACTION_POINT_ERRORS.ACTION_POINT_TITLE_INVALID),
  isCompleted: z.boolean().optional().default(false),
});

/**
 * Type inference for the validated action point creation data.
 */
export type CreateActionPointInput = z.infer<typeof createActionPointSchema>;

/**
 * Zod schema for validating action point update requests.
 * Validates that:
 * - title (if provided) is non-empty after trimming and max 255 characters
 * - isCompleted (if provided) is a boolean
 * - at least one field is provided
 *
 * The schema automatically trims whitespace to prevent XSS and ensure clean data.
 */
export const updateActionPointSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, ACTION_POINT_ERRORS.ACTION_POINT_TITLE_INVALID)
      .max(255, ACTION_POINT_ERRORS.ACTION_POINT_TITLE_INVALID)
      .optional(),
    isCompleted: z.boolean().optional(),
  })
  .refine((data) => data.title !== undefined || data.isCompleted !== undefined, {
    message: ACTION_POINT_ERRORS.VALIDATION_ERROR,
  });

/**
 * Type inference for the validated action point update data.
 */
export type UpdateActionPointInput = z.infer<typeof updateActionPointSchema>;
