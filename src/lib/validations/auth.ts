import { z } from "zod";

// Messages are i18n keys under "validation" (see components/form-field.tsx).
const email = z.string().trim().min(1, "required").email("emailInvalid");

// Mirrors the backend policy in auth/dto/password.rules.ts
export const passwordSchema = z
  .string()
  .min(8, "passwordMin")
  .max(72, "passwordMax")
  .regex(/\p{L}/u, "passwordLetter")
  .regex(/\d/, "passwordNumber");

export const personName = z
  .string()
  .trim()
  .min(2, "nameMin")
  .max(50, "nameMax")
  .regex(/^[\p{L}][\p{L}\s'-]*$/u, "nameInvalid");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "required"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: personName,
    lastName: personName,
    email,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordMismatch",
  });
export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordMismatch",
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  firstName: personName,
  lastName: personName,
});
export type ProfileFormData = z.infer<typeof profileSchema>;
