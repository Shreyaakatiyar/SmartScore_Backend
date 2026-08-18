import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .optional(),

  role: z
    .enum([
      "STUDENT",
      "TEACHER",
      "INVIGILATOR",
      "INSTITUTION_ADMIN",
      "PLATFORM_ADMIN",
    ])
    .optional()
    .default("STUDENT"),

  instituteId: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});

export type RefreshTokenInput = z.infer<
  typeof refreshTokenSchema
>;