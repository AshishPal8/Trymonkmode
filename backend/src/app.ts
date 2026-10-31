import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter, authLimiter } from "./middlewares/rateLimit.middleware.js";
import { NotFoundError } from "./utils/errors.js";
import { sendResponse } from "./utils/apiResponse.js";
import { HttpStatus } from "./utils/httpStatus.js";

import { authRoutes } from "./modules/auth/auth.route.js";
import {
  googleCallback,
  googleLogin,
  googleNativeAuthHandler,
} from "./modules/auth/auth.controller.js";
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
import blogsRoutes from "./modules/blogs/blogs.route.js";
import uploadRoutes from "./modules/upload/upload.route.js";
import { notificationRoutes } from "./modules/notifications/notifications.route.js";
import { settingsRoutes } from "./modules/settings/settings.route.js";
import { focusRoutes } from "./modules/focus/focus.route.js";
import { streakRoutes } from "./modules/streak/streak.route.js";

export const app = express();

// Required for GCP Cloud Run / reverse proxies so secure cookies work
app.set("trust proxy", 1);

// Only our own frontend (FRONTEND_URL) may call the API from a browser.
const FRONTEND_ORIGIN = new URL(env.FRONTEND_URL).origin;

app.use(
  helmet({
    // JSON API: no HTML to protect with CSP, and images may be loaded cross-site.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header = not a browser cross-site request (curl, server-to-server,
      // same-origin via the Next.js proxy). CORS doesn't apply there.
      if (!origin) return callback(null, true);
      return callback(null, origin === FRONTEND_ORIGIN ? origin : false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-refresh-token",
      "x-timezone",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
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

app.use("/api", apiLimiter);

app.get("/api/google", authLimiter, googleLogin);
app.get("/api/google/callback", authLimiter, googleCallback);
app.post("/api/google/native", authLimiter, googleNativeAuthHandler);

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
app.use("/api/v1/blogs", blogsRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/focus", focusRoutes);
app.use("/api/v1/streak", streakRoutes);

app.use((_req, _res, next) => {
  next(new NotFoundError("The requested endpoint or resource does not exist."));
});

app.use(errorHandler);
