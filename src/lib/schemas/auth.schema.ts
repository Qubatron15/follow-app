import { z } from "zod";

/**
 * Email validation schema
 * RFC 5322 compliant, max 255 characters
 */
export const emailSchema = z
  .string()
  .min(1, "E-mail jest wymagany")
  .max(255, "E-mail jest za długi (max 255 znaków)")
  .email("Nieprawidłowy format adresu e-mail");

/**
 * Password validation schema
 * Min 8 characters, 1 uppercase, 1 digit, 1 special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
  .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Hasło musi zawierać co najmniej jeden znak specjalny"
  );

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Hasło jest wymagane"),
});

/**
 * Register form schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

/**
 * Password reset request schema
 */
export const resetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset confirmation schema
 */
export const resetConfirmSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

/**
 * Type exports
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetRequestFormData = z.infer<typeof resetRequestSchema>;
export type ResetConfirmFormData = z.infer<typeof resetConfirmSchema>;
