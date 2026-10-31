import { Router } from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  refreshTokenHandler,
  getMeHandler,
  logoutHandler,
  googleLogin,
  googleCallback,
  googleNativeAuthHandler,
  googleExchangeHandler,
} from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from "./auth.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  authLimiter,
  refreshLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
} from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.get("/google", authLimiter, googleLogin);
router.get("/google/callback", authLimiter, googleCallback);
router.post("/google/native", authLimiter, googleNativeAuthHandler);
router.post("/google/exchange", authLimiter, googleExchangeHandler);

router.post("/send-otp", validate({ body: sendOtpSchema }), otpSendLimiter, sendOtpHandler);
router.post(
  "/verify-otp",
  validate({ body: verifyOtpSchema }),
  otpVerifyLimiter,
  verifyOtpHandler,
);
router.post(
  "/refresh-token",
  refreshLimiter,
  validate({ body: refreshTokenSchema }),
  refreshTokenHandler,
);
router.post("/logout", logoutHandler);

router.get("/me", authenticate, getMeHandler);

export const authRoutes = router;
