import { eq, desc } from "drizzle-orm";
import { db } from "../../config/db.js";
import {
  users,
  userSettings,
  userPlans,
  userFavorites,
} from "../../db/schema.js";
import { NotFoundError } from "../../utils/errors.js";
import { getFullUserProfile } from "../auth/auth.service.js";
import type {
  UpdateProfileInput,
  UpdateUserRoleTierInput,
} from "./user.schema.js";

export async function getProfileService(userId: number) {
  const profile = await getFullUserProfile(userId);
  if (!profile) {
    throw new NotFoundError("User not found.");
  }
  return profile;
}

export async function updateProfileService(
  userId: number,
  input: UpdateProfileInput,
) {
  const userUpdates: any = {};
  if (input.name !== undefined) userUpdates.name = input.name;
  if (input.avatar !== undefined) userUpdates.avatar = input.avatar;
  if (input.title !== undefined) userUpdates.title = input.title;
  if (input.bio !== undefined) userUpdates.bio = input.bio;

  if (Object.keys(userUpdates).length > 0) {
    userUpdates.updatedAt = new Date();
    await db.update(users).set(userUpdates).where(eq(users.id, userId));
  }

  const settingsUpdates: any = {};
  if (input.theme !== undefined) settingsUpdates.theme = input.theme;
  if (input.timezone !== undefined) settingsUpdates.timezone = input.timezone;
  if (input.notificationsEnabled !== undefined)
    settingsUpdates.notificationsEnabled = input.notificationsEnabled;
  if (input.emailNotifications !== undefined)
    settingsUpdates.emailNotifications = input.emailNotifications;
  if (input.soundEffects !== undefined)
    settingsUpdates.soundEffects = input.soundEffects;

  if (Object.keys(settingsUpdates).length > 0) {
    settingsUpdates.updatedAt = new Date();
    await db
      .update(userSettings)
      .set(settingsUpdates)
      .where(eq(userSettings.userId, userId));
  }

  if (input.favorites !== undefined && Array.isArray(input.favorites)) {
    await db.delete(userFavorites).where(eq(userFavorites.userId, userId));

    for (let i = 0; i < input.favorites.length; i++) {
      await db.insert(userFavorites).values({
        userId,
        pageKey: input.favorites[i],
        orderIndex: i + 1,
        isPinned: true,
      });
    }
  }

  return getFullUserProfile(userId);
}

export async function getAllUsersService() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  const fullProfiles = await Promise.all(
    allUsers.map((u) => getFullUserProfile(u.id)),
  );
  return fullProfiles.filter(Boolean);
}

export async function updateUserRoleTierService(
  targetUserId: number,
  input: UpdateUserRoleTierInput,
) {
  if (input.role !== undefined) {
    await db
      .update(users)
      .set({ role: input.role, updatedAt: new Date() })
      .where(eq(users.id, targetUserId));
  }

  const planUpdates: any = {};
  if (input.planTier !== undefined) planUpdates.planTier = input.planTier;
  if (input.planStatus !== undefined) planUpdates.planStatus = input.planStatus;

  if (Object.keys(planUpdates).length > 0) {
    planUpdates.updatedAt = new Date();
    await db
      .update(userPlans)
      .set(planUpdates)
      .where(eq(userPlans.userId, targetUserId));
  }

  return getFullUserProfile(targetUserId);
}
