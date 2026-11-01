import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default("4000")
    .transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  JWT_SECRET: z
    .string()
    .min(8, "JWT_SECRET must be at least 8 characters")
    .default("trymonk_jwt_secret_dev_key"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(8, "JWT_REFRESH_SECRET must be at least 8 characters")
    .default("trymonk_refresh_jwt_secret_dev_key"),
  GOOGLE_CLIENT_ID: z
    .string()
    .default(() => process.env.GOOGLE_CLIENT_ID || ""),
  // Extra Google OAuth client IDs (comma separated) allowed for native sign-in,
  // e.g. the Android / iOS app clients.
  GOOGLE_NATIVE_CLIENT_IDS: z
    .string()
    .default(() => process.env.GOOGLE_NATIVE_CLIENT_IDS || ""),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .default(() => process.env.GOOGLE_CLIENT_SECRET || ""),
  GOOGLE_CALLBACK_URL: z
    .string()
    .default(
      () =>
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:4000/api/google/callback",
    ),
  IMAGEKIT_PUBLIC_KEY: z
    .string()
    .default(() => process.env.IMAGEKIT_PUBLIC_KEY || ""),
  IMAGEKIT_PRIVATE_KEY: z
    .string()
    .default(() => process.env.IMAGEKIT_PRIVATE_KEY || ""),
  IMAGEKIT_URL_ENDPOINT: z
    .string()
    .default(() => process.env.IMAGEKIT_URL_ENDPOINT || ""),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);

if (
  env.NODE_ENV === "production" &&
  (env.JWT_SECRET === "trymonk_jwt_secret_dev_key" ||
    env.JWT_REFRESH_SECRET === "trymonk_refresh_jwt_secret_dev_key")
) {
  console.error(
    "🚨 [Security] JWT_SECRET / JWT_REFRESH_SECRET are the built-in dev defaults. Set strong random values in the Cloud Run environment.",
  );
}
