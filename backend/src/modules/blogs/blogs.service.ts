import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import { db } from "../../config/db.js";
import { blogs } from "../../db/schema.js";
import type {
  CreateBlogInput,
  UpdateBlogInput,
  QueryBlogInput,
} from "./blogs.schema.js";
import { NotFoundError } from "../../utils/errors.js";

export const DEFAULT_SEED_BLOGS: CreateBlogInput[] = [
  {
    title: "The Monk Mode Protocol: Master 4-Hour Deep Work Sprints",
    slug: "monk-mode-protocol-deep-work",
    description:
      "Discover the neurochemical framework behind deep focus, eliminating dopamine traps, and achieving 10x output in 4 uninterrupted hours.",
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    author: "Ashish Pal",
    tags: ["Monk Mode", "Deep Work", "Productivity"],
    readTimeMinutes: 6,
    isActive: true,
    content: `# The Monk Mode Protocol: Master 4-Hour Deep Work Sprints

In a world engineered for constant dopamine micro-hits, the ability to concentrate deeply for unbroken blocks of time is a superpower.

## What is Monk Mode?

Monk Mode is a dedicated period of radical focus where you eliminate non-essential distractions, protect your biological peak energy windows, and direct 100% of your cognitive capacity towards your highest-leverage goals.

> "To produce at your peak level you need to work for extended periods with full concentration on a single task free from distraction." — Cal Newport

---

## The 3 Non-Negotiable Pillars

### 1. Zero Cognitive Fragmentation
Every notification, open social media tab, or Slack message inflicts **attention residue**. When you switch contexts, part of your brain remains stuck on the previous stimulus.
- Put your phone in another room or on Airplane Mode.
- Block distracting URLs using your focus timer.
- Work in full-screen single-window mode.

### 2. Biological Prime Time Calibration
Your circadian rhythm governs when your prefrontal cortex operates at peak efficiency. For most knowledge workers, this occurs between **8:00 AM and 12:00 PM**.
- Guard this 4-hour window aggressively.
- Schedule zero meetings, calls, or passive email checks during this phase.

### 3. Deliberate Recovery & Rest
High intensity work requires deep restoration. When your timer concludes:
- Go for a 15-minute screen-free walk.
- Hydrate and practice 5 minutes of box breathing.
- Never transition directly from deep focus into scrolling short-form videos.

---

## Daily Action Checklist
1. Write down your **#1 Priority Task** the night before in your Monk Mode dashboard.
2. Start the **25m Focus Timer** immediately upon sitting at your desk.
3. Track your streak daily to build unshakable momentum.
`,
  },
  {
    title: "Dopamine Detox: How to Reset Your Brain's Motivation Circuits",
    slug: "dopamine-detox-brain-reset",
    description:
      "Learn how hyper-stimulating digital feeds desensitize your baseline dopamine levels and the 7-day protocol to regain deep motivation.",
    coverImage:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80",
    author: "Monk Mode Team",
    tags: ["Mindset", "Habits", "Neuroscience"],
    readTimeMinutes: 5,
    isActive: true,
    content: `# Dopamine Detox: How to Reset Your Brain's Motivation Circuits

Have you ever found it nearly impossible to sit down and read a book or write code, yet effortlessly scrolled social feeds for 3 hours?

You are not lazy. Your brain's **dopamine reward baseline** has simply been hijacked.

---

## The Dopamine Baseline Problem

Dopamine is not the molecule of pleasure—it is the molecule of **anticipation and pursuit**. When you expose your brain to infinite variable rewards (reels, notifications, algorithmic feeds), your dopamine baseline spikes unnaturally high.

When you subsequently attempt low-stimulation, high-value tasks (like studying or deep work), your brain perceives them as agonizingly boring.

---

## The 7-Day Reset Protocol

### Rule #1: Friction on Digital Traps
- Log out of all social media on your browser.
- Remove high-dopamine apps from your primary mobile screen.

### Rule #2: Fasting from High-Dopamine Inputs Before Noon
- Do not check news, feeds, or messaging apps until your first 2 hours of deep work are completed.
- Replace morning scrolling with a 10-minute mindfulness journal entry.

### Rule #3: Embracing Boredom
Boredom is the catalyst for genuine creativity. Allow yourself 10 minutes every day of doing literally nothing—no phone, no music, no podcasts.

---

## Conclusion
Resetting your dopamine circuits transforms hard work into an engaging, enjoyable flow state. Start small with a single 24-hour digital fast this weekend.
`,
  },
  {
    title: "The Eisenhower Matrix: Stop Being Busy and Start Being Effective",
    slug: "eisenhower-matrix-prioritization-guide",
    description:
      "Master the 4-quadrant decision framework used by world leaders and top CEOs to eliminate urgent trivia and focus on high-impact leverage.",
    coverImage:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&auto=format&fit=crop&q=80",
    author: "Ashish Pal",
    tags: ["Time Management", "Strategy", "Execution"],
    readTimeMinutes: 4,
    isActive: true,
    content: `# The Eisenhower Matrix: Stop Being Busy and Start Being Effective

> "What is important is seldom urgent, and what is urgent is seldom important." — Dwight D. Eisenhower

Most people spend 80% of their working day reacting to the urgent demands of others: emails, notifications, and artificial deadlines.

---

## The 4 Quadrants Explained

### Q1: Urgent & Important (Do First)
- Production outages, immediate deadlines, critical health emergencies.
- **Action**: Execute swiftly without procrastination.

### Q2: Not Urgent, but Important (Schedule / The Sweet Spot)
- Deep work projects, fitness, skill acquisition, long-term strategic planning.
- **Action**: This is where all true long-term compounding happens. Dedicate at least 3 hours daily here.

### Q3: Urgent, but Not Important (Delegate / Automate)
- Minor interruptions, non-essential meetings, routine status requests.
- **Action**: Say no politely or batch them into a single 30-minute block.

### Q4: Neither Urgent nor Important (Eliminate)
- Mindless doomscrolling, busywork, excessive TV consumption.
- **Action**: Eradicate completely.

---

## How to Apply in TryMonkMode
Open the **Matrix Tab** in your navigation bar. Categorize your daily tasks into P1 (Urgent/Important) and P2 (Strategic Focus) to immediately bring clarity to your day.
`,
  },
];

export async function ensureBlogsSeeded() {
  try {
    const existing = await db.select().from(blogs).limit(1);
    if (existing.length === 0) {
      for (const blog of DEFAULT_SEED_BLOGS) {
        await db.insert(blogs).values(blog as any).onConflictDoNothing();
      }
      console.log("✅ Default SEO blogs seeded into PostgreSQL blogs table.");
    }
  } catch (err) {
    console.error("Blog seeding check:", err);
  }
}

export async function getPublicBlogsService(query: QueryBlogInput) {
  await ensureBlogsSeeded();

  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || "10", 10)));
  const offset = (page - 1) * limit;

  const conditions = [
    eq(blogs.isDeleted, false),
    eq(blogs.isActive, true),
  ];

  if (query.search && query.search.trim()) {
    const searchPattern = `%${query.search.trim()}%`;
    conditions.push(
      or(
        ilike(blogs.title, searchPattern),
        ilike(blogs.description, searchPattern),
      )!,
    );
  }

  const whereClause = and(...conditions);

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        description: blogs.description,
        coverImage: blogs.coverImage,
        author: blogs.author,
        authorAvatar: blogs.authorAvatar,
        tags: blogs.tags,
        readTimeMinutes: blogs.readTimeMinutes,
        viewCount: blogs.viewCount,
        createdAt: blogs.createdAt,
      })
      .from(blogs)
      .where(whereClause)
      .orderBy(desc(blogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(blogs)
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function getBlogBySlugService(slug: string) {
  await ensureBlogsSeeded();

  const [found] = await db
    .select()
    .from(blogs)
    .where(
      and(
        eq(blogs.slug, slug),
        eq(blogs.isDeleted, false),
        eq(blogs.isActive, true),
      ),
    )
    .limit(1);

  if (!found) {
    throw new NotFoundError("Article not found or is currently private.");
  }

  // Increment view count asynchronously
  db.update(blogs)
    .set({ viewCount: sql`${blogs.viewCount} + 1` })
    .where(eq(blogs.id, found.id))
    .catch((err) => console.error("Error incrementing view count:", err));

  return found;
}

export async function getAllBlogsAdminService(query: QueryBlogInput) {
  await ensureBlogsSeeded();

  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const offset = (page - 1) * limit;

  const conditions = [eq(blogs.isDeleted, false)];

  if (query.search && query.search.trim()) {
    const searchPattern = `%${query.search.trim()}%`;
    conditions.push(
      or(
        ilike(blogs.title, searchPattern),
        ilike(blogs.description, searchPattern),
      )!,
    );
  }

  const whereClause = and(...conditions);

  const [items, totalResult] = await Promise.all([
    db
      .select()
      .from(blogs)
      .where(whereClause)
      .orderBy(desc(blogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(blogs)
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function createBlogService(input: CreateBlogInput) {
  const formattedSlug = input.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const [created] = await db
    .insert(blogs)
    .values({
      ...input,
      slug: formattedSlug,
      updatedAt: new Date(),
    })
    .returning();

  return created;
}

export async function updateBlogService(id: number, input: UpdateBlogInput) {
  const updates: any = { ...input, updatedAt: new Date() };

  if (input.slug) {
    updates.slug = input.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const [updated] = await db
    .update(blogs)
    .set(updates)
    .where(and(eq(blogs.id, id), eq(blogs.isDeleted, false)))
    .returning();

  if (!updated) {
    throw new NotFoundError("Article not found.");
  }

  return updated;
}

export async function deleteBlogService(id: number) {
  const [deleted] = await db
    .update(blogs)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(blogs.id, id))
    .returning();

  if (!deleted) {
    throw new NotFoundError("Article not found.");
  }

  return deleted;
}
