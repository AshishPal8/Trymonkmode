import cron, { type ScheduledTask } from "node-cron";
import { lt } from "drizzle-orm";
import { db } from "../../config/db.js";
import { notificationLogs, otps, refreshTokens } from "../../db/schema.js";
import { isFlagEnabled } from "../settings/settings.service.js";

let cleanupTask: ScheduledTask | null = null;

async function processDailyCleanup() {
  const isEnabled = await isFlagEnabled("cleanup_cron", true);
  if (!isEnabled) {
    console.log(
      "⏸️ [Cron:Cleanup] Cleanup Cron is DISABLED in system_settings (cleanup_cron = 0). Skipping midnight cleanup.",
    );
    return;
  }

  console.log("🧹 [Cron:Cleanup] Running Midnight Database Maintenance...");

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    await db
      .delete(notificationLogs)
      .where(lt(notificationLogs.createdAt, thirtyDaysAgo));

    await db.delete(otps).where(lt(otps.expiresAt, oneDayAgo));

    await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, thirtyDaysAgo));

    console.log(
      "✨ [Cron:Cleanup] Daily Database Cleanup completed successfully.",
    );
  } catch (error) {
    console.error("❌ [Cron:Cleanup] Error during database cleanup:", error);
  }
}

export function startCleanupCron(): ScheduledTask {
  if (cleanupTask) {
    return cleanupTask;
  }

  cleanupTask = cron.schedule("0 0 * * *", processDailyCleanup);
  console.log(
    "  🕒 [Cron] Cleanup Job Scheduled  -> (0 0 * * *) Every midnight",
  );
  return cleanupTask;
}

export function stopCleanupCron(): void {
  if (cleanupTask) {
    cleanupTask.stop();
    cleanupTask = null;
    console.log("  🛑 [Cron] Cleanup Job Stopped.");
  }
}
