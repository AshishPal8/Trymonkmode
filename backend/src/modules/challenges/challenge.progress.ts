// Reads each member's daily amount for a challenge's metric, straight from
// data saved on the server. One grouped query per challenge, however many members.

import { sql, type SQL } from "drizzle-orm";
import { db } from "../../config/db.js";
import { addDays } from "../../utils/date.js";
import type { ChallengeMetric } from "./challenge.rules.js";

export interface ProgressWindow {
  id: number;
  metric: ChallengeMetric;
  startDate: string;
  endDate: string;
  timezone: string;
}

/** userId -> (day -> amount) */
export type DailyValues = Map<number, Map<string, number>>;

type Row = { user_id: number; day: string; value: number };

const idList = (ids: number[]) => sql.join(ids.map((id) => sql`${id}`), sql`, `);

/** The SQL that returns (user_id, day, value) rows for one metric. */
function metricQuery(c: ProgressWindow, ids: SQL): SQL {
  const tz = c.timezone;
  // Widen the timestamp range by a day each side so timezones can't cut rows off;
  // the exact day filter is done on the local date.
  const from = addDays(c.startDate, -1);
  const to = addDays(c.endDate, 2);
  const localDay = (column: SQL) => sql`(${column} at time zone ${tz})::date`;

  switch (c.metric) {
    case "focus_minutes":
    case "focus_sessions": {
      const day = localDay(sql`ended_at`);
      const value = c.metric === "focus_minutes" ? sql`sum(duration_minutes)` : sql`count(*)`;
      return sql`
        select user_id, ${day}::text as day, ${value}::int as value
        from focus_sessions
        where user_id in (${ids}) and ended_at >= ${from}::date and ended_at < ${to}::date
          and ${day} between ${c.startDate}::date and ${c.endDate}::date
        group by 1, 2`;
    }
    case "tasks_done": {
      const day = localDay(sql`completed_at`);
      return sql`
        select user_id, ${day}::text as day, count(*)::int as value
        from tasks
        where user_id in (${ids}) and completed = true
          and completed_at >= ${from}::date and completed_at < ${to}::date
          and ${day} between ${c.startDate}::date and ${c.endDate}::date
        group by 1, 2`;
    }
    case "habit_checkins":
      // completed_dates already holds the user's local days ("YYYY-MM-DD").
      return sql`
        select h.user_id, d.day, count(*)::int as value
        from habits h, jsonb_array_elements_text(h.completed_dates) as d(day)
        where h.user_id in (${ids}) and d.day between ${c.startDate} and ${c.endDate}
        group by 1, 2`;
    case "manual":
      return sql`
        select user_id, day::text as day, 1 as value
        from challenge_checkins
        where challenge_id = ${c.id} and user_id in (${ids})`;
  }
}

export async function loadDailyValues(challenge: ProgressWindow, userIds: number[]): Promise<DailyValues> {
  const result: DailyValues = new Map(userIds.map((id) => [id, new Map()]));
  if (userIds.length === 0) return result;

  const { rows } = await db.execute<Row>(metricQuery(challenge, idList(userIds)));
  for (const row of rows) result.get(row.user_id)?.set(row.day, row.value);
  return result;
}
