export type ThemeMode = 'dark' | 'light';

export type CategoryHub = 'productivity' | 'focus' | 'mind' | 'finance';

export type ActiveModuleId =
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'matrix'
  | 'goals'
  | 'pomodoro'
  | 'stopwatch'
  | 'habits'
  | 'journal'
  | 'notes'
  | 'bookmarks'
  | 'finance'
  | 'analytics';

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
  role?: 'superadmin' | 'admin' | 'user';
  planTier?: 'free' | 'pro' | 'ai_ultra' | 'lifetime';
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  joinedDate: string;
}

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

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
  quadrant: 'urgent-important' | 'notUrgent-important' | 'urgent-notImportant' | 'notUrgent-notImportant';
  createdAt: string;
}

export interface HabitItem {
  id: string;
  title: string;
  description?: string;
  timeFrom: string;
  timeTo: string;
  priority: 'high' | 'medium' | 'low';
  category: 'Health' | 'Fitness' | 'Work' | 'Mindset' | 'Learning';
  color: string;
  icon: string;
  targetDays: number[];
  completedDates: string[]; // ['2026-08-26']
  streak: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  category: 'deep-work' | 'meeting' | 'fitness' | 'personal' | 'learning';
  color: string;
  location?: string;
}

export type MoodType = 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'stressed' | 'down';

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

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
}

export interface GoalItem {
  id: string;
  title: string;
  category: 'Career' | 'Fitness' | 'Finance' | 'Learning' | 'Personal';
  timeframe: 'yearly' | 'monthly' | 'weekly';
  deadline: string;
  progress: number; // 0-100
  color: string;
  milestones: GoalMilestone[];
  targetMetric?: string;
  createdAt: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  category: 'GitHub' | 'YouTube' | 'Books' | 'Articles' | 'Tools' | 'Websites' | 'Courses';
  type: 'repo' | 'book' | 'article' | 'video' | 'tool' | 'link';
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  title: string;
  category: 'Salary' | 'Food' | 'Transport' | 'Tech & Subscriptions' | 'Rent' | 'Health' | 'Shopping' | 'General';
  amount: number;
  type: 'expense' | 'income';
  date: string;
  time: string;
  paymentMethod: 'Apple Pay' | 'Credit Card' | 'PayPal' | 'Bank Transfer' | 'Cash';
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