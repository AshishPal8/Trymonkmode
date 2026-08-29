import { eq, and, gt, desc } from "drizzle-orm";
import crypto from "crypto";
import { db } from "../../config/db.js";
import {
  users,
  otps,
  refreshTokens,
  userSettings,
  userPlans,
  userFavorites,
} from "../../db/schema.js";
import { generateOtp, hashOtp, verifyOtpHash } from "../../utils/otp.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  type UserTokenPayload,
} from "../../utils/jwt.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/errors.js";
import { env } from "../../config/env.js";

export interface GoogleProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export async function getFullUserProfile(userId: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return null;

  let [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  if (!settings) {
    const [newSettings] = await db
      .insert(userSettings)
      .values({ userId: user.id })
      .returning();
    settings = newSettings;
  }

  let [plan] = await db
    .select()
    .from(userPlans)
    .where(eq(userPlans.userId, userId))
    .limit(1);
  if (!plan) {
    const isSuperadmin = user.role === "superadmin";
    const [newPlan] = await db
      .insert(userPlans)
      .values({
        userId: user.id,
        planTier: isSuperadmin ? "lifetime" : "free",
        planStatus: "active",
      })
      .returning();
    plan = newPlan;
  }

  const favRows = await db
    .select()
    .from(userFavorites)
    .where(eq(userFavorites.userId, userId))
    .orderBy(userFavorites.orderIndex);

  const favorites = favRows.map((f) => f.pageKey);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar:
      user.avatar && !user.avatar.includes("images.unsplash.com")
        ? user.avatar
        : null,
    title: user.title,
    bio: user.bio,
    role: user.role,
    streak: user.streak,
    level: user.level,
    xp: user.xp,
    theme: settings.theme,
    timezone: settings.timezone,
    notificationsEnabled: settings.notificationsEnabled,
    emailNotifications: settings.emailNotifications,
    soundEffects: settings.soundEffects,
    planTier: plan.planTier,
    planStatus: plan.planStatus,
    planExpiresAt: plan.planExpiresAt,
    favorites,
    createdAt: user.createdAt,
  };
}

export async function exchangeGoogleCode(code: string): Promise<string> {
  if (!code) {
    throw new BadRequestError("Authorization code is required.");
  }

  const params = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Google Token Exchange Failed:", errText);
    throw new BadRequestError(
      "Failed to exchange Google code for access token.",
    );
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new BadRequestError("No access token returned by Google.");
  }

  return data.access_token;
}

export async function fetchGoogleProfile(
  accessToken: string,
): Promise<GoogleProfile> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new BadRequestError("Failed to fetch Google user profile.");
  }

  const profile = (await response.json()) as {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  };

  if (!profile.email) {
    throw new BadRequestError("Google profile did not contain a valid email.");
  }

  return {
    id: profile.id,
    email: profile.email.toLowerCase().trim(),
    name: profile.name,
    picture: profile.picture,
  };
}

export async function findOrCreateGoogleUser(
  googleProfile: GoogleProfile,
  ipAddress?: string,
  userAgent?: string,
) {
  const { email, name, picture } = googleProfile;

  let [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let user = existing;

  if (existing) {
    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (picture && !existing.avatar) {
      updates.avatar = picture;
    }
    if (name && !existing.name) {
      updates.name = name;
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, existing.id))
      .returning();
    user = updated;
  } else {
    const displayName = name?.trim() || email.split("@")[0];
    const [created] = await db
      .insert(users)
      .values({
        email,
        name: displayName,
        avatar: picture || null,
        title: "",
        bio: "",
        role: "user",
        streak: 1,
        level: 1,
        xp: 0,
      })
      .returning();
    user = created;

    await db.insert(userSettings).values({
      userId: user.id,
      theme: "dark",
      timezone: "UTC",
      notificationsEnabled: true,
      emailNotifications: true,
      soundEffects: true,
    });

    await db.insert(userPlans).values({
      userId: user.id,
      planTier: "free",
      planStatus: "active",
    });
  }

  const fullProfile = await getFullUserProfile(user.id);

  const tokenPayload: UserTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    planTier: fullProfile?.planTier || "free",
  };

  const accessToken = generateAccessToken(tokenPayload);

  // Manage refresh token session
  const rawRefreshTokenHash = crypto.randomBytes(32).toString("hex");
  const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [createdTokenRecord] = await db
    .insert(refreshTokens)
    .values({
      userId: user.id,
      tokenHash: rawRefreshTokenHash,
      ipAddress,
      userAgent,
      expiresAt: refreshExpiresAt,
      isRevoked: false,
    })
    .returning();

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    tokenId: createdTokenRecord.id,
  });

  return {
    user: fullProfile,
    accessToken,
    refreshToken,
    tokenExpiresIn: "1h",
    refreshTokenExpiresIn: "30d",
  };
}

export async function sendOtpService(
  email: string,
  type?: "login" | "signup",
  name?: string,
) {
  const [existingUser] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (type === "login" && !existingUser) {
    throw new NotFoundError(
      "No account found with this email address. Please sign up first.",
    );
  }

  if (type === "signup" && existingUser) {
    throw new BadRequestError(
      "An account with this email address already exists. Please sign in instead.",
    );
  }

  const rawOtp = generateOtp();
  const otpHash = await hashOtp(rawOtp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db
    .update(otps)
    .set({ isUsed: true })
    .where(and(eq(otps.email, email), eq(otps.isUsed, false)));
  await db.insert(otps).values({
    email,
    otpHash,
    expiresAt,
    isUsed: false,
  });

  return {
    email,
    otp: rawOtp,
    expiresInMinutes: 5,
    message: `OTP sent successfully to ${email}.`,
  };
}

export async function verifyOtpService(
  email: string,
  rawOtp: string,
  ipAddress?: string,
  userAgent?: string,
  name?: string,
  type?: "login" | "signup",
) {
  const [otpRecord] = await db
    .select()
    .from(otps)
    .where(
      and(
        eq(otps.email, email),
        eq(otps.isUsed, false),
        gt(otps.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(otps.createdAt))
    .limit(1);

  if (!otpRecord) {
    throw new BadRequestError(
      "Invalid or expired OTP. Please request a new one.",
    );
  }

  const isMatch = await verifyOtpHash(rawOtp, otpRecord.otpHash);
  if (!isMatch) {
    throw new BadRequestError("Incorrect OTP entered. Please try again.");
  }

  await db.update(otps).set({ isUsed: true }).where(eq(otps.id, otpRecord.id));

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (type === "login" && !user) {
    throw new NotFoundError(
      "No account found with this email address. Please sign up first.",
    );
  }

  if (!user) {
    const displayName = name && name.trim() ? name.trim() : email.split("@")[0];
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: displayName,
        title: "",
        bio: "",
        role: "user",
        streak: 1,
        level: 1,
        xp: 0,
      })
      .returning();
    user = newUser;

    await db.insert(userSettings).values({
      userId: user.id,
      theme: "dark",
      timezone: "UTC",
      notificationsEnabled: true,
      emailNotifications: true,
      soundEffects: true,
    });

    await db.insert(userPlans).values({
      userId: user.id,
      planTier: "free",
      planStatus: "active",
    });
  } else {
    if (name && name.trim() && user.name !== name.trim()) {
      const [updatedUser] = await db
        .update(users)
        .set({
          name: name.trim(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();
      user = updatedUser;
    }
  }

  const fullProfile = await getFullUserProfile(user.id);

  const tokenPayload: UserTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    planTier: fullProfile?.planTier || "free",
  };

  const accessToken = generateAccessToken(tokenPayload);

  const rawRefreshTokenHash = crypto.randomBytes(32).toString("hex");
  const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [createdTokenRecord] = await db
    .insert(refreshTokens)
    .values({
      userId: user.id,
      tokenHash: rawRefreshTokenHash,
      ipAddress,
      userAgent,
      expiresAt: refreshExpiresAt,
      isRevoked: false,
    })
    .returning();

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    tokenId: createdTokenRecord.id,
  });

  return {
    user: fullProfile,
    accessToken,
    refreshToken,
    tokenExpiresIn: "1h",
    refreshTokenExpiresIn: "30d",
  };
}

export async function rotateRefreshTokenService(
  rawRefreshToken: string,
  ipAddress?: string,
  userAgent?: string,
) {
  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new UnauthorizedError(
      "Invalid or expired refresh token. Please log in again.",
    );
  }

  const [tokenRecord] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.id, decoded.tokenId),
        eq(refreshTokens.userId, decoded.userId),
        eq(refreshTokens.isRevoked, false),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!tokenRecord) {
    throw new UnauthorizedError("Refresh token has been revoked or expired.");
  }

  await db
    .update(refreshTokens)
    .set({ isRevoked: true })
    .where(eq(refreshTokens.id, tokenRecord.id));

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);
  if (!user) {
    throw new NotFoundError("User account not found.");
  }

  const fullProfile = await getFullUserProfile(user.id);

  const newRefreshTokenHash = crypto.randomBytes(32).toString("hex");
  const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [newRecord] = await db
    .insert(refreshTokens)
    .values({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      ipAddress,
      userAgent,
      expiresAt: newExpiresAt,
      isRevoked: false,
    })
    .returning();

  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    planTier: fullProfile?.planTier || "free",
  });

  const newRefreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    tokenId: newRecord.id,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    tokenExpiresIn: "1h",
    refreshTokenExpiresIn: "30d",
  };
}

export async function logoutService(rawRefreshToken: string) {
  try {
    const decoded = verifyRefreshToken(rawRefreshToken);
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, decoded.tokenId));
  } catch {}
  return { message: "Logged out successfully." };
}

export async function getMeService(userId: number) {
  const profile = await getFullUserProfile(userId);
  if (!profile) {
    throw new NotFoundError("User not found.");
  }
  return profile;
}
