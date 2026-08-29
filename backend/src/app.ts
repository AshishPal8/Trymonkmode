import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/errors.js";
import { sendResponse } from "./utils/apiResponse.js";
import { HttpStatus } from "./utils/httpStatus.js";

import { authRoutes } from "./modules/auth/auth.route.js";
import { googleCallback, googleLogin } from "./modules/auth/auth.controller.js";
import { userRoutes } from "./modules/user/user.route.js";
import { taskRoutes } from "./modules/tasks/tasks.route.js";
import { calendarRoutes } from "./modules/calendar/calendar.route.js";
import { habitRoutes } from "./modules/habits/habits.route.js";
import { journalRoutes } from "./modules/journal/journal.route.js";
import { goalRoutes } from "./modules/goals/goals.route.js";
import { financeRoutes } from "./modules/finance/finance.route.js";
import notesRoutes from "./modules/notes/notes.route.js";
import { bookmarkRoutes } from "./modules/bookmarks/bookmarks.route.js";
import pagesRoutes from "./modules/pages/pages.route.js";
import { analyticsRoutes } from "./modules/analytics/analytics.route.js";

export const app = express();

// Required for GCP Cloud Run / reverse proxies so secure cookies work
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = [
        env.FRONTEND_URL,
        "https://trymonkmode.vercel.app",
        "https://trymonkmode.in",
        "https://www.trymonkmode.in",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ];

      if (
        allowed.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("trymonkmode")
      ) {
        return callback(null, origin);
      }
      return callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get("/health", (_req, res) => {
  return sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Try Monk Mode API is healthy and operational ⚡",
    data: {
      status: "UP",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.get("/api/google", googleLogin);
app.get("/api/google/callback", googleCallback);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/pages", pagesRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/calendar", calendarRoutes);
app.use("/api/v1/habits", habitRoutes);
app.use("/api/v1/journal", journalRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/finance", financeRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/bookmarks", bookmarkRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.use((_req, _res, next) => {
  next(new NotFoundError("The requested endpoint or resource does not exist."));
});

app.use(errorHandler);
