import type { GoalKind } from "@/lib/types";

export interface GoalTemplate {
  id: string;
  emoji: string;
  title: string;
  why: string;
  kind: GoalKind;
  category: string;
  color: string;
  /** Suggested length; the deadline is set this many days from today. */
  days: number;
  milestones: string[];
}

/** Ready-made goals to start from. Everything stays editable. */
export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: "dsa",
    emoji: "🧠",
    title: "Learn DSA",
    why: "Crack coding interviews at product companies",
    kind: "project",
    category: "Learning",
    color: "#8B5CF6",
    days: 90,
    milestones: [
      "Arrays, strings & hashing",
      "Two pointers & sliding window",
      "Linked lists, stacks & queues",
      "Trees & BST",
      "Graphs (BFS, DFS, shortest paths)",
      "Dynamic programming",
      "Mock interviews",
    ],
  },
  {
    id: "startup",
    emoji: "🚀",
    title: "Launch my startup",
    why: "Get the first 100 users and real feedback",
    kind: "project",
    category: "Startup",
    color: "#F59E0B",
    days: 60,
    milestones: [
      "Talk to 10 potential users",
      "Write down the problem & one-line pitch",
      "Build the MVP",
      "Landing page + waitlist",
      "Launch (Product Hunt, Reddit, LinkedIn)",
      "First 100 users",
    ],
  },
  {
    id: "exam",
    emoji: "📚",
    title: "Exam prep",
    why: "Finish the syllabus with time left for revision",
    kind: "project",
    category: "Learning",
    color: "#0052FF",
    days: 45,
    milestones: [
      "List the syllabus & weak topics",
      "First pass of every chapter",
      "Short notes & formula sheet",
      "Previous years' papers",
      "Full mock tests",
      "Final revision",
    ],
  },
  {
    id: "deep-work",
    emoji: "⏱️",
    title: "100 hours of deep work",
    why: "Build the habit of long, focused sessions",
    kind: "focus",
    category: "Personal",
    color: "#10B981",
    days: 60,
    milestones: [],
  },
];
