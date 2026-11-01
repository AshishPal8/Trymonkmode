import type { GroupFeedItem, GroupMember } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";
import { displayName } from "@/modules/leaderboard/friendHelpers";

/** "Asha focused 50m", "Riya unlocked 🔥 Week warrior", "Kabir joined". */
export function feedText(item: GroupFeedItem, members: GroupMember[]): string {
  const member = members.find((m) => m.id === item.userId);
  const who = member ? displayName(member) : "Someone";
  if (item.kind === "focus") return `${who} focused ${formatMinutes(item.minutes ?? 0)}`;
  if (item.kind === "badge") return `${who} unlocked ${item.emoji ?? ""} ${item.title ?? "a badge"}`;
  return `${who} joined the group`;
}

/** "5m ago", "3h ago", "2d ago". */
export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 60 / 24)}d ago`;
}

export const GOAL_HOURS_OPTIONS = [5, 10, 20, 40].map((h) => ({ value: String(h * 60), label: `${h} hours / week` }));
