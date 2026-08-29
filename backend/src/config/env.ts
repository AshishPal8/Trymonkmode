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
});

export const env = envSchema.parse(process.env);
