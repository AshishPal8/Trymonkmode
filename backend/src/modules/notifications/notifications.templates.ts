// All reminder copy lives here so the wording stays consistent and is easy
// to tweak. Keep titles short (they get cut off on phones around 40 chars).

export type NotificationMessage = { title: string; body: string };

const MAX_TITLE_ITEM = 40;
const MAX_BODY = 120;

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/** "14:30" -> "2:30 PM". Leaves anything unexpected as it is. */
export function formatClock(hhmm: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(hhmm || "");
  if (!match) return hhmm;
  const h = Number(match[1]);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${match[2]} ${suffix}`;
}

/** 5 -> "5 min", 60 -> "1 hr", 90 -> "1 hr 30 min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function firstNameOf(name?: string | null): string | null {
  const first = (name || "").trim().split(/\s+/)[0];
  return first ? first : null;
}

/** Whole minutes until `targetMs`, rounded to the nearest minute. */
export function minutesUntil(targetMs: number, nowMs = Date.now()): number {
  return Math.max(0, Math.round((targetMs - nowMs) / 60000));
}

export function taskReminderMessage(input: {
  title: string;
  description?: string | null;
  priority?: string | null;
  dueTime?: string | null;
  minutesLeft: number;
}): NotificationMessage {
  const name = clip(input.title, MAX_TITLE_ITEM);
  const isUrgent = input.priority === "P1";
  const dueAt = input.dueTime ? formatClock(input.dueTime) : null;

  if (input.minutesLeft >= 2) {
    const detail = input.description
      ? clip(input.description, MAX_BODY)
      : dueAt
        ? `Due at ${dueAt}.${isUrgent ? " This one's high priority." : ""}`
        : "Tap to open it.";
    return {
      title: `⏰ ${name} — due in ${formatDuration(input.minutesLeft)}`,
      body: detail,
    };
  }

  if (input.minutesLeft < -1) {
    return {
      title: dueAt ? `⏰ ${name} was due at ${dueAt}` : `⏰ ${name} is overdue`,
      body: "Still on your list. Knock it out when you can ✓",
    };
  }

  return {
    title: `⏰ ${name} is due now`,
    body: input.description
      ? clip(input.description, MAX_BODY)
      : isUrgent
        ? "High priority. Finish it and check it off ✓"
        : "Finish it and check it off ✓",
  };
}

export function eventReminderMessage(input: {
  title: string;
  startTime: string;
  endTime: string;
  category?: string | null;
  minutesLeft: number;
}): NotificationMessage {
  const name = clip(input.title, MAX_TITLE_ITEM);
  const when = `${formatClock(input.startTime)} – ${formatClock(input.endTime)}`;
  const body = input.category ? `${when} · ${input.category}` : when;

  if (input.minutesLeft >= 2) {
    return {
      title: `📅 ${name} starts in ${formatDuration(input.minutesLeft)}`,
      body,
    };
  }
  return { title: `📅 ${name} is starting now`, body };
}

export function habitReminderMessage(input: {
  title: string;
  description?: string | null;
  streak?: number | null;
  firstName?: string | null;
}): NotificationMessage {
  const name = clip(input.title, MAX_TITLE_ITEM);
  const streak = input.streak || 0;

  const title = input.firstName
    ? `🌱 Time for ${name}, ${input.firstName}`
    : `🌱 Time for ${name}`;

  let body: string;
  if (streak >= 2) {
    body = `🔥 You're on a ${streak}-day streak. Keep it going!`;
  } else if (input.description) {
    body = clip(input.description, MAX_BODY);
  } else {
    body = "A few minutes is all it takes. Check it off today.";
  }

  return { title, body };
}
