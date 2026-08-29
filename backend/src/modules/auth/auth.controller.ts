import { Request, Response, NextFunction } from "express";
import {
  sendOtpService,
  verifyOtpService,
  rotateRefreshTokenService,
  getMeService,
  logoutService,
  exchangeGoogleCode,
  fetchGoogleProfile,
  findOrCreateGoogleUser,
} from "./auth.service.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";
import { env } from "../../config/env.js";

const isProd =
  env.NODE_ENV === "production" ||
  (typeof env.FRONTEND_URL === "string" &&
    env.FRONTEND_URL.startsWith("https://"));

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: 60 * 60 * 1000, // 1 hour
  path: "/",
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

export const googleLogin = (_req: Request, res: Response): void => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
};

export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { code, error } = req.query as { code?: string; error?: string };

    if (error || !code) {
      console.warn("Google OAuth warning:", error || "No code query received");
      res.redirect(`${env.FRONTEND_URL}/?error=google_auth_failed`);
      return;
    }

    const clientIp =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      req.ip;
    const userAgent = req.headers["user-agent"] as string;

    const accessToken = await exchangeGoogleCode(code);
    const googleProfile = await fetchGoogleProfile(accessToken);
    const result = await findOrCreateGoogleUser(
      googleProfile,
      clientIp,
      userAgent,
    );

    res.cookie("access_token", result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refresh_token", result.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.redirect(
      `${env.FRONTEND_URL}/?google_auth=success&token=${encodeURIComponent(
        result.accessToken,
      )}&refresh=${encodeURIComponent(result.refreshToken)}`,
    );
  } catch (err) {
    console.error("Google OAuth Callback Error:", err);
    res.redirect(`${env.FRONTEND_URL}/?error=google_auth_failed`);
  }
};

export async function sendOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, type, name } = req.body;
    const result = await sendOtpService(email, type, name);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, otp, name, type } = req.body;
    const clientIp =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      req.ip;
    const userAgent = req.headers["user-agent"] as string;

    const result = await verifyOtpService(
      email,
      otp,
      clientIp,
      userAgent,
      name,
      type,
    );

    res.cookie("access_token", result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refresh_token", result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Authentication successful. Welcome to Try Monk Mode!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const rawRefreshToken =
      req.cookies?.refresh_token || req.body?.refreshToken;
    const clientIp =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      req.ip;
    const userAgent = req.headers["user-agent"] as string;

    const result = await rotateRefreshTokenService(
      rawRefreshToken,
      clientIp,
      userAgent,
    );

    res.cookie("access_token", result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refresh_token", result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Session token refreshed successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getMeService(req.user!.userId);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "User profile retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const rawRefreshToken =
      req.cookies?.refresh_token || req.body?.refreshToken;
    if (rawRefreshToken) {
      await logoutService(rawRefreshToken);
    }

    res.clearCookie("access_token", {
      path: "/",
      secure: isProd,
      sameSite: isProd ? ("none" as const) : ("lax" as const),
    });
    res.clearCookie("refresh_token", {
      path: "/",
      secure: isProd,
      sameSite: isProd ? ("none" as const) : ("lax" as const),
    });

    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
}
