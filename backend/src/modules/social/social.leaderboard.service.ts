import { sql, type SQL } from "drizzle-orm";
import { db } from "../../config/db.js";
import { daysAgo } from "../../utils/date.js";
import type { LeaderboardSort } from "./social.schema.js";

// Everyone who shares their stats, ranked. Private users are left out.

/** What each sort ranks by (ties: more XP first, then the older account). */
const ORDER_BY: Record<LeaderboardSort, SQL> = {
  xp: sql`xp desc, id asc`,
  streak: sql`streak desc, xp desc, id asc`,
  focus: sql`week_focus_minutes desc, xp desc, id asc`,
};

type RankedRow = {
  rank: number;
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
  xp: number;
  level: number;
  streak: number;
  week_focus_minutes: number;
  total: number;
};

/**
 * One query builds the ranked list (window function); we read one page of it
 * plus the signed-in user's own row, so "your rank" shows on every page.
 */
function rankedUsers(sort: LeaderboardSort) {
  return sql`
    with week_focus as (
      select user_id, sum(duration_minutes)::int as minutes
      from focus_sessions
      where ended_at >= ${daysAgo(7)}
      group by user_id
    ),
    visible as (
      select u.id, u.name, u.username, u.avatar, u.xp, u.level, u.streak,
             coalesce(w.minutes, 0) as week_focus_minutes
      from users u
      left join user_settings s on s.user_id = u.id
      left join week_focus w on w.user_id = u.id
      where coalesce(s.stats_visibility, 'public') <> 'private'
    )
    select *,
           (row_number() over (order by ${ORDER_BY[sort]}))::int as rank,
           (count(*) over ())::int as total
    from visible`;
}

const toEntry = (r: RankedRow) => ({
  rank: r.rank,
  user: { id: r.id, name: r.name, username: r.username, avatar: r.avatar },
  stats: { xp: r.xp, level: r.level, streak: r.streak, weekFocusMinutes: r.week_focus_minutes },
});

export async function getLeaderboardService(me: number, sort: LeaderboardSort, page: number, limit: number) {
  const offset = (page - 1) * limit;
  const ranked = rankedUsers(sort);

  const [pageRows, myRows] = await Promise.all([
    db.execute<RankedRow>(sql`select * from (${ranked}) r order by rank limit ${limit} offset ${offset}`),
    db.execute<RankedRow>(sql`select * from (${ranked}) r where id = ${me}`),
  ]);

  const total = pageRows.rows[0]?.total ?? myRows.rows[0]?.total ?? 0;
  return {
    sort,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    items: pageRows.rows.map(toEntry),
    /** Null when the user keeps their stats private. */
    me: myRows.rows[0] ? toEntry(myRows.rows[0]) : null,
  };
}
