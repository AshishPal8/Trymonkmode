import { Router } from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  refreshTokenHandler,
  getMeHandler,
  logoutHandler,
  googleLogin,
  googleCallback,
} from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from "./auth.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Google OAuth
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// OTP Auth
router.post("/send-otp", validate({ body: sendOtpSchema }), sendOtpHandler);
router.post(
  "/verify-otp",
  validate({ body: verifyOtpSchema }),
  verifyOtpHandler,
);
router.post(
  "/refresh-token",
  validate({ body: refreshTokenSchema }),
  refreshTokenHandler,
);
router.post("/logout", logoutHandler);

// Profile
router.get("/me", authenticate, getMeHandler);

export const authRoutes = router;
