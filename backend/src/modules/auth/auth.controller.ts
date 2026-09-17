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
import { setAuthCookies, clearAuthCookies } from "../../utils/cookie.js";

export const googleLogin = (req: Request, res: Response): void => {
  const redirect =
    (req.query.redirect as string) || (req.query.redirect_uri as string) || "";
  const platform = (req.query.platform as string) || "";

  let state = "";
  if (redirect || platform) {
    state = Buffer.from(JSON.stringify({ redirect, platform })).toString(
      "base64",
    );
  }

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    ...(state ? { state } : {}),
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
    const { code, error, state } = req.query as {
      code?: string;
      error?: string;
      state?: string;
    };

    let stateObj: { redirect?: string; platform?: string } = {};
    if (state) {
      try {
        stateObj = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
      } catch (e) {
        console.warn("Could not parse OAuth state:", e);
      }
    }

    const redirectTarget = stateObj.redirect;

    if (error || !code) {
      console.warn("Google OAuth warning:", error || "No code query received");
      if (
        redirectTarget &&
        (redirectTarget.startsWith("mobile://") ||
          redirectTarget.startsWith("trymonkmode://") ||
          redirectTarget.startsWith("exp://"))
      ) {
        const sep = redirectTarget.includes("?") ? "&" : "?";
        res.redirect(`${redirectTarget}${sep}error=google_auth_failed`);
        return;
      }
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

    setAuthCookies(res, result.accessToken, result.refreshToken);

    // If explicit redirect target was passed (e.g. http://localhost:3000, mobile://, etc.)
    if (redirectTarget) {
      const isAllowedTarget =
        redirectTarget.startsWith("http://localhost:") ||
        redirectTarget.startsWith("http://127.0.0.1:") ||
        redirectTarget.startsWith("https://trymonkmode.in") ||
        redirectTarget.startsWith("https://www.trymonkmode.in") ||
        redirectTarget.startsWith("mobile://") ||
        redirectTarget.startsWith("trymonkmode://") ||
        redirectTarget.startsWith("exp://");

      if (isAllowedTarget) {
        const sep = redirectTarget.includes("?") ? "&" : "?";
        res.redirect(
          `${redirectTarget}${sep}google_auth=success&token=${encodeURIComponent(
            result.accessToken,
          )}&refresh=${encodeURIComponent(result.refreshToken)}`,
        );
        return;
      }
    }

    res.redirect(
      `${env.FRONTEND_URL}/?google_auth=success&token=${encodeURIComponent(
        result.accessToken,
      )}&refresh=${encodeURIComponent(result.refreshToken)}`,
    );
  } catch (err) {
    console.error("Google OAuth Callback Error:", err);
    if (req.query.state) {
      try {
        const stateObj = JSON.parse(
          Buffer.from(req.query.state as string, "base64").toString("utf-8"),
        );
        if (
          stateObj.redirect &&
          (stateObj.redirect.startsWith("mobile://") ||
            stateObj.redirect.startsWith("trymonkmode://") ||
            stateObj.redirect.startsWith("exp://"))
        ) {
          const sep = stateObj.redirect.includes("?") ? "&" : "?";
          res.redirect(`${stateObj.redirect}${sep}error=google_auth_failed`);
          return;
        }
      } catch {}
    }
    res.redirect(`${env.FRONTEND_URL}/?error=google_auth_failed`);
  }
};

export const googleNativeAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { accessToken, profile } = req.body as {
      accessToken?: string;
      profile?: { id: string; email: string; name?: string; picture?: string };
    };

    let googleProfile = profile;
    if (!googleProfile && accessToken) {
      googleProfile = await fetchGoogleProfile(accessToken);
    }

    if (!googleProfile || !googleProfile.email) {
      res.status(400).json({
        statusCode: 400,
        message: "Google profile or accessToken required.",
      });
      return;
    }

    const clientIp =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      req.ip;
    const userAgent = req.headers["user-agent"] as string;

    const result = await findOrCreateGoogleUser(
      googleProfile,
      clientIp,
      userAgent,
    );

    setAuthCookies(res, result.accessToken, result.refreshToken);

    sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Google sign-in successful.",
      data: result,
    });
  } catch (err) {
    next(err);
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

    setAuthCookies(res, result.accessToken, result.refreshToken);

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

    setAuthCookies(res, result.accessToken, result.refreshToken);

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

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawRefreshToken =
      req.cookies?.refresh_token || req.body?.refreshToken;
    if (rawRefreshToken) {
      await logoutService(rawRefreshToken).catch(() => {});
    }

    clearAuthCookies(res);

    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};
