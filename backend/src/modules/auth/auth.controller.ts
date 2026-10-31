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
  verifyNativeGoogleToken,
  createLoginCode,
  redeemLoginCode,
} from "./auth.service.js";
import { UnauthorizedError } from "../../utils/errors.js";
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

type RedirectKind = { kind: "web"; url: string } | { kind: "app"; url: string };

const APP_SCHEMES = new Set(["mobile:", "trymonkmode:", "exp:"]);
function safeRedirect(target?: string): RedirectKind | null {
  if (!target) return null;
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return null;
  }
  if (APP_SCHEMES.has(url.protocol)) return { kind: "app", url: target };
  if (url.origin === new URL(env.FRONTEND_URL).origin)
    return { kind: "web", url: target };
  return null;
}

function withParams(url: string, params: Record<string, string>) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${new URLSearchParams(params).toString()}`;
}

function parseState(state?: string): { redirect?: string; platform?: string } {
  if (!state) return {};
  try {
    return JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
  } catch {
    return {};
  }
}

export const googleCallback = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  const { code, error, state } = req.query as {
    code?: string;
    error?: string;
    state?: string;
  };
  const target = safeRedirect(parseState(state).redirect);
  const fail = () => {
    const base = target?.url || `${env.FRONTEND_URL}/`;
    res.redirect(withParams(base, { error: "google_auth_failed" }));
  };

  try {
    if (error || !code) {
      console.warn("Google OAuth warning:", error || "No code query received");
      return fail();
    }

    const clientIp =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      req.ip;
    const userAgent = req.headers["user-agent"] as string;

    const googleAccessToken = await exchangeGoogleCode(code);
    const googleProfile = await fetchGoogleProfile(googleAccessToken);
    const result = await findOrCreateGoogleUser(
      googleProfile,
      clientIp,
      userAgent,
    );

    // Only useful when this callback is served from our own domain.
    setAuthCookies(res, result.accessToken, result.refreshToken);

    // Native app (custom URL scheme): the app reads the tokens from the link.
    if (target?.kind === "app") {
      res.redirect(
        withParams(target.url, {
          google_auth: "success",
          token: result.accessToken,
          refresh: result.refreshToken,
        }),
      );
      return;
    }

    const loginCode = await createLoginCode(result.refreshToken);
    res.redirect(
      withParams(target?.url || `${env.FRONTEND_URL}/`, {
        google_auth: "success",
        code: loginCode,
      }),
    );
  } catch (err) {
    console.error("Google OAuth Callback Error:", err);
    fail();
  }
};

export const googleExchangeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const code = String(req.body?.code || "");
    if (code.length < 20) throw new UnauthorizedError("Missing sign-in code.");
    const result = await redeemLoginCode(code);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Signed in.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const googleNativeAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { accessToken } = req.body as { accessToken?: string };
    if (!accessToken) {
      throw new UnauthorizedError("A Google access token is required.");
    }
    const googleProfile = await verifyNativeGoogleToken(accessToken);

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
    const candidates = [
      req.cookies?.refresh_token,
      req.body?.refreshToken,
    ].filter(
      (t, i, arr): t is string =>
        typeof t === "string" && t.length > 20 && arr.indexOf(t) === i,
    );
    const clientIp =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      req.ip;
    const userAgent = req.headers["user-agent"] as string;

    let result: Awaited<ReturnType<typeof rotateRefreshTokenService>> | null =
      null;
    let lastError: unknown = new UnauthorizedError(
      "No refresh token provided. Please log in again.",
    );
    for (const candidate of candidates) {
      try {
        result = await rotateRefreshTokenService(
          candidate,
          clientIp,
          userAgent,
        );
        break;
      } catch (err) {
        lastError = err;
      }
    }
    if (!result) throw lastError;

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
