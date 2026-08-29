import { z } from "zod";

const optionalNameSchema = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
  z.string().max(150).optional(),
);

export const sendOtpSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  name: optionalNameSchema,
  type: z.enum(["login", "signup"]).optional(),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
  name: optionalNameSchema,
  type: z.enum(["login", "signup"]).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const googleAuthCallbackSchema = z.object({
  code: z.string().optional(),
  token: z.string().optional(),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
