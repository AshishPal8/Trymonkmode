export type ThemeMode = "dark" | "light";

export type CategoryHub = "productivity" | "focus" | "mind" | "finance";

export type ActiveModuleId =
  | "dashboard"
  | "tasks"
  | "calendar"
  | "matrix"
  | "goals"
  | "pomodoro"
  | "stopwatch"
  | "habits"
  | "journal"
  | "notes"
  | "bookmarks"
  | "finance"
  | "analytics"
  | "leaderboard"
  | "challenges"
  | "groups"
  | "admin";

export interface AppPageItem {
  id: number;
  key: ActiveModuleId;
  name: string;
  path: string;
  hub: string;
  icon: string;
  orderIndex: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  title: string;
  bio?: string;
  theme?: ThemeMode;
  favorites?: ActiveModuleId[];
  timezone?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  soundEffects?: boolean;
  reminderLeadMinutes?: number;
  notifyTaskReminders?: boolean;
  notifyEventReminders?: boolean;
  notifyHabitReminders?: boolean;
  restDays?: number[];
  role?: "superadmin" | "admin" | "user";
  planTier?: "free" | "pro" | "ai_ultra" | "lifetime";
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  joinedDate: string;
}

export type PriorityLevel = "P1" | "P2" | "P3" | "P4";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  completed: boolean;
  completedAt?: string;
  quadrant:
    | "urgent-important"
    | "notUrgent-important"
    | "urgent-notImportant"
    | "notUrgent-notImportant";
  createdAt: string;
  goalId?: string | null;
  milestoneId?: string | null;
}

export interface HabitItem {
  id: string;
  title: string;
  description?: string;
  timeFrom: string;
  timeTo: string;
  priority: "high" | "medium" | "low";
  category: "Health" | "Fitness" | "Work" | "Mindset" | "Learning";
  color: string;
  icon: string;
  targetDays: number[];
  completedDates: string[]; // ['2026-08-26']
  streak: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  category: "deep-work" | "meeting" | "fitness" | "personal" | "learning";
  color: string;
  location?: string;
}

export type MoodType =
  | "ecstatic"
  | "happy"
  | "neutral"
  | "sad"
  | "stressed"
  | "down";

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  rating: number; // 1-5
  howWasYourDay: string;
  highlights: string;
  gratitude: string[];
  proudestAchievement: string;
  tomorrowPriority: string;
  improvements?: string;
  stickers: string[];
  affirmation: string;
  dailyPrompt?: string;
  dailyPromptAnswer?: string;
  isLocked?: boolean;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color: string; // Hex code for one of the 8 predefined aesthetic colors
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export type GoalKind = "project" | "target" | "focus";
export type GoalStatus = "active" | "paused" | "done";

export interface GoalMilestone {
  id: string;
  title: string;
  dueDate?: string | null;
  completed: boolean;
  taskTotal: number;
  taskDone: number;
}

/** A goal is also a project: milestones + linked tasks + focus time. */
export interface GoalItem {
  id: string;
  title: string;
  description?: string;
  why?: string;
  category: string;
  timeframe: string;
  kind: GoalKind;
  status: GoalStatus;
  targetMetric?: string;
  unit?: string;
  currentProgress: number;
  targetProgress: number;
  targetFocusMinutes?: number | null;
  startDate?: string | null;
  deadline?: string | null;
  color: string;
  icon: string;
  // Computed by the server
  progress: number; // 0-100
  focusMinutes: number;
  taskTotal: number;
  taskDone: number;
  nextTask?: { title: string; dueDate: string } | null;
  milestones: GoalMilestone[];
  createdAt: string;
}

/** What the create / edit form sends. */
export interface GoalInput {
  title: string;
  why?: string;
  description?: string;
  category?: string;
  timeframe?: string;
  kind?: GoalKind;
  status?: GoalStatus;
  unit?: string;
  currentProgress?: number;
  targetProgress?: number;
  targetFocusMinutes?: number;
  startDate?: string | null;
  deadline?: string | null;
  color?: string;
  icon?: string;
  milestones?: { title: string; dueDate?: string | null }[];
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  category:
    | "GitHub"
    | "YouTube"
    | "Books"
    | "Articles"
    | "Tools"
    | "Websites"
    | "Courses";
  type: "repo" | "book" | "article" | "video" | "tool" | "link";
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  title: string;
  category:
    | "Salary"
    | "Food"
    | "Transport"
    | "Tech & Subscriptions"
    | "Rent"
    | "Health"
    | "Shopping"
    | "General";
  amount: number;
  type: "expense" | "income";
  date: string;
  time: string;
  paymentMethod:
    | "Apple Pay"
    | "Credit Card"
    | "PayPal"
    | "Bank Transfer"
    | "Cash";
  note?: string;
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  taskTitle?: string;
  category?: string;
  date?: string;
  completedAt?: string;
  mode?: string;
  tag?: string;
  timestamp?: string;
  notes?: string;
  completed?: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  icon: string;
}

export interface DailyVelocityItem {
  day: string;
  date: string;
  focusHours: number;
  completedTasks: number;
  completedHabits: number;
  isPeak: boolean;
  heightPct: number;
}

export interface CategoryDistributionItem {
  tag: string;
  count: number;
  pct: number;
  color: string;
}

export interface ConsistencyScorecard {
  adherence: number;
  habitRate: number;
  flowStateTier: string;
}

export interface AnalyticsData {
  totalFocusHours: number;
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalHabits: number;
  weeklyAdherenceRate: number;
  habitCompletionRate: number;
  streak: number;
  streakStatus?: StreakStatus;
  xp: number;
  level: number;
  xpToNextLevel: number;
  peakDayName: string;
  optimalTimeWindow: string;
  optimalTimeDescription: string;
  velocityTier: string;
  dailyVelocity: DailyVelocityItem[];
  categoryDistribution?: CategoryDistributionItem[];
  consistencyScorecard?: ConsistencyScorecard;
}
export type StreakDayState =
  | "active"
  | "rest"
  | "repaired"
  | "missed"
  | "today"
  | "future";

export interface StreakStatus {
  current: number;
  brokenOn: string | null;
  streakIfRepaired: number | null;
  week: { date: string; dow: number; state: StreakDayState }[];
  activeDaysThisWeek: number;
  weekStart: string;
  todayIsRest: boolean;
  activeToday: boolean;
  restDays: number[];
  repairsLeft: number;
  repairsPerMonth: number;
  canRepair: boolean;
  weeklyGoalDays: number;
  weeklyBonusXp: number;
  weeklyBonusEarned: boolean;
  bonusJustEarned: boolean;
}

// ─── Friends ─────────────────────────────────────────────────────────────────

export type StatsVisibility = "public" | "private";

export interface PublicUser {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
}

/** Null when the friend keeps their stats private. */
export interface FriendStats {
  streak: number;
  xp: number;
  level: number;
  weekFocusMinutes: number;
  /** Set while they're in a focus session (ISO time it ends). */
  focusingUntil?: string | null;
}

export interface Friend extends PublicUser {
  since: string;
  stats: FriendStats | null;
}

export interface FriendRequest extends PublicUser {
  sentAt: string;
}

export interface FriendsData {
  friends: Friend[];
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  blocked: PublicUser[];
}

export interface SocialProfile {
  username: string | null;
  inviteCode: string;
  statsVisibility: StatsVisibility;
  /** Friends who signed up through my invite link. */
  referralCount: number;
}

export type LeaderboardSort = "xp" | "streak" | "focus";

export interface LeaderboardEntry {
  rank: number;
  user: PublicUser;
  stats: FriendStats;
}

export interface LeaderboardPage {
  sort: LeaderboardSort;
  page: number;
  totalPages: number;
  total: number;
  items: LeaderboardEntry[];
  /** Null when your stats are private. */
  me: LeaderboardEntry | null;
}

// ─── Challenges ──────────────────────────────────────────────────────────────

export type ChallengeMetric = "focus_minutes" | "focus_sessions" | "tasks_done" | "habit_checkins" | "manual";
export type ChallengePhase = "upcoming" | "active" | "ended";

export interface ChallengeStanding {
  daysDone: number;
  totalValue: number;
  todayValue: number;
  streak: number;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  emoji: string;
  metric: ChallengeMetric;
  metricLabel: string;
  dailyTarget: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  phase: ChallengePhase;
  dayNumber: number;
  memberCount: number;
}

export interface ChallengeListItem extends Challenge {
  myStanding?: ChallengeStanding | null;
}

export interface ChallengeLists {
  joined: ChallengeListItem[];
  available: ChallengeListItem[];
}

export interface ChallengeRankRow {
  rank: number;
  user: PublicUser;
  standing: ChallengeStanding;
}

export interface ChallengeDetail extends Challenge {
  isMember: boolean;
  canCheckIn: boolean;
  leaderboard: ChallengeRankRow[];
  me: ChallengeRankRow | null;
}

export interface NewChallengeInput {
  title: string;
  description: string;
  emoji: string;
  metric: ChallengeMetric;
  dailyTarget: number;
  durationDays: number;
  startDate: string;
}

// ─── Achievements ────────────────────────────────────────────────────────────

export type AchievementRule =
  | "streak_days"
  | "focus_hours"
  | "tasks_completed"
  | "goals_finished"
  | "habit_checkins"
  | "challenges_completed";

export interface AchievementDefinition {
  id: number;
  key: string;
  title: string;
  description: string;
  emoji: string;
  rule: AchievementRule;
  threshold: number;
  xpReward: number;
  isActive: boolean;
  orderIndex: number;
}

export interface MyAchievement extends AchievementDefinition {
  unit: string;
  unlockedAt: string | null;
  current: number;
  progress: number;
}

export interface MyAchievements {
  items: MyAchievement[];
  unlockedCount: number;
  total: number;
}

export type UnlockedBadge = Pick<AchievementDefinition, "id" | "title" | "description" | "emoji" | "xpReward">;

export interface AdminAchievement extends AchievementDefinition {
  unlockCount: number;
}

export type AchievementInput = Omit<AchievementDefinition, "id">;

// ─── Groups & focus together ─────────────────────────────────────────────────

export interface GroupSummary {
  id: number;
  name: string;
  emoji: string;
  weeklyGoalMinutes: number;
  isOwner: boolean;
  memberCount?: number;
  weekMinutes: number;
  weekProgress: number;
  streakWeeks: number;
}

export interface GroupMember extends PublicUser {
  isOwner: boolean;
  streak: number;
  weekMinutes: number;
}

export interface GroupFeedItem {
  kind: "focus" | "badge" | "joined";
  userId: number;
  minutes: number | null;
  title: string | null;
  emoji: string | null;
  at: string;
}

export interface GroupDetail extends GroupSummary {
  /** The signed-in user's id. */
  myId: number;
  members: GroupMember[];
  feed: GroupFeedItem[];
}

export interface FocusRoom {
  id: number;
  hostId: number;
  durationMinutes: number;
  endsAt: string;
}

export interface GroupLive {
  focusing: { userId: number; endsAt: string; roomId: number | null }[];
  room: FocusRoom | null;
}

export interface NewGroupInput {
  name: string;
  emoji: string;
  weeklyGoalMinutes: number;
  memberIds: number[];
}
