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
} from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from "./auth.schema.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.post("/google/native", googleNativeAuthHandler);

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

router.get("/me", authenticate, getMeHandler);

export const authRoutes = router;
