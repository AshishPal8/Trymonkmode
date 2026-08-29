import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/errors.js";
import { sendResponse } from "./utils/apiResponse.js";
import { HttpStatus } from "./utils/httpStatus.js";

// Feature Route Imports
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

// 1. Core Middlewares
app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// 2. Health Check
app.get("/health", (_req, res) => {
  return sendResponse({
    res,
    statusCode: HttpStatus.OK,
    message: "Try Monk Mode API is healthy and operational ⚡",
    data: {
      status: "UP",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: "1.0.0",
      routes: [
        "/api/v1/auth",
        "/api/v1/users",
        "/api/v1/pages",
        "/api/v1/tasks",
        "/api/v1/calendar",
        "/api/v1/habits",
        "/api/v1/journal",
        "/api/v1/goals",
        "/api/v1/finance",
        "/api/v1/notes",
        "/api/v1/bookmarks",
        "/api/v1/analytics",
      ],
    },
  });
});

// Google OAuth Top-Level Direct Endpoints
app.get("/api/google", googleLogin);
app.get("/api/google/callback", googleCallback);

// 3. API Version 1 Route Registry
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

// 4. 404 Catch-All Handler
app.use((_req, _res, next) => {
  next(new NotFoundError("The requested endpoint or resource does not exist."));
});

// 5. Global Centralized Error Handler
app.use(errorHandler);
