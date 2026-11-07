// Plans and prices, shared by the landing page, /pricing and (later) checkout.
// Prices are in rupees. The backend will hold its own copy for charging:
// the browser never decides what to charge.

export type PlanId = "free" | "pro_monthly" | "pro_yearly";

export interface PlanFeature {
  text: string;
  /** Not built yet: shown with a "Soon" tag. */
  soon?: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  price: number;
  period: "forever" | "month" | "year";
  /** Shown under the price, e.g. "₹125 / month, billed yearly". */
  note?: string;
  highlight?: boolean;
  features: PlanFeature[];
}

export const PRO_MONTHLY_PRICE = 199;
export const PRO_YEARLY_PRICE = 1499;
/** 1 - 1499 / (199 × 12) ≈ 37% */
export const YEARLY_SAVING_PCT = Math.round((1 - PRO_YEARLY_PRICE / (PRO_MONTHLY_PRICE * 12)) * 100);

/** Payments aren't live yet: Pro buttons send people to sign up for free. */
export const PAYMENTS_LIVE = false;

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Everything you need to build a daily focus habit.",
    price: 0,
    period: "forever",
    features: [
      { text: "Tasks, calendar and priority matrix" },
      { text: "Goals & projects with milestones" },
      { text: "Habits, journal and notes" },
      { text: "Focus timer, stopwatch and session history" },
      { text: "Streaks with rest days and 1 repair a month" },
      { text: "Friends, groups, challenges and leaderboard" },
      { text: "Badges and XP" },
    ],
  },
  {
    id: "pro_monthly",
    name: "Monk Pro",
    tagline: "For serious builders who want more from every hour.",
    price: PRO_MONTHLY_PRICE,
    period: "month",
    note: "Cancel anytime",
    highlight: true,
    features: [
      { text: "Everything in Free" },
      { text: "3 streak repairs a month" },
      { text: "AI brain dump → daily plan", soon: true },
      { text: "AI goal breakdown into milestones and tasks", soon: true },
      { text: "Weekly AI coach report", soon: true },
      { text: "Advanced analytics and full focus history", soon: true },
      { text: "Export all your data", soon: true },
    ],
  },
  {
    id: "pro_yearly",
    name: "Monk Pro Yearly",
    tagline: "All of Pro, for a full year of deep work.",
    price: PRO_YEARLY_PRICE,
    period: "year",
    note: `₹${Math.round(PRO_YEARLY_PRICE / 12)} / month · save ${YEARLY_SAVING_PCT}%`,
    features: [
      { text: "Everything in Monk Pro" },
      { text: `Save ${YEARLY_SAVING_PCT}% compared to monthly` },
      { text: "Early access to new features" },
    ],
  },
];

/** "₹1,499" */
export const formatRupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
