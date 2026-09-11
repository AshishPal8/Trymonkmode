import { startReminderCron, stopReminderCron } from "./reminders.cron.js";
import { startCleanupCron, stopCleanupCron } from "./cleanup.cron.js";

let isCronRunning = false;

export function startAllCrons() {
  if (isCronRunning) {
    console.log("⚡ [Cron Engine] Crons are already initialized.");
    return;
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚡ [Cron Engine] Initializing Server Background Workers...");

  startReminderCron();

  startCleanupCron();

  isCronRunning = true;
  console.log("✅ [Cron Engine] All background cron services active.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

export function stopAllCrons() {
  if (!isCronRunning) return;

  console.log("🛑 [Cron Engine] Stopping all background cron services...");
  stopReminderCron();
  stopCleanupCron();
  isCronRunning = false;
  console.log("✅ [Cron Engine] All background cron services stopped.");
}

export { startReminderCron, stopReminderCron } from "./reminders.cron.js";
export { startCleanupCron, stopCleanupCron } from "./cleanup.cron.js";
