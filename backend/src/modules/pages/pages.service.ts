import { eq, asc } from "drizzle-orm";
import { db } from "../../config/db.js";
import { appPages } from "../../db/schema.js";
import type { CreateAppPageInput, UpdateAppPageInput } from "./pages.schema.js";
import { NotFoundError } from "../../utils/errors.js";

export const DEFAULT_APP_PAGES = [
  {
    key: "dashboard",
    name: "Dashboard",
    path: "/dashboard",
    hub: "Productivity",
    icon: "LayoutDashboard",
    orderIndex: 1,
    isEnabled: true,
  },
  {
    key: "tasks",
    name: "Tasks",
    path: "/tasks",
    hub: "Productivity",
    icon: "CheckSquare",
    orderIndex: 2,
    isEnabled: true,
  },
  {
    key: "calendar",
    name: "Calendar",
    path: "/calendar",
    hub: "Productivity",
    icon: "Calendar",
    orderIndex: 3,
    isEnabled: true,
  },
  {
    key: "matrix",
    name: "Matrix",
    path: "/matrix",
    hub: "Productivity",
    icon: "Grid",
    orderIndex: 4,
    isEnabled: true,
  },
  {
    key: "goals",
    name: "Goals",
    path: "/goals",
    hub: "Productivity",
    icon: "Target",
    orderIndex: 5,
    isEnabled: true,
  },

  {
    key: "pomodoro",
    name: "Focus Timer",
    path: "/pomodoro",
    hub: "Focus",
    icon: "Clock",
    orderIndex: 6,
    isEnabled: true,
  },

  {
    key: "habits",
    name: "Habits",
    path: "/habits",
    hub: "Mind & Wellness",
    icon: "Zap",
    orderIndex: 7,
    isEnabled: true,
  },
  {
    key: "journal",
    name: "Journal",
    path: "/journal",
    hub: "Mind & Wellness",
    icon: "BookOpen",
    orderIndex: 8,
    isEnabled: true,
  },
  {
    key: "notes",
    name: "Notes & Ideas",
    path: "/notes",
    hub: "Mind & Wellness",
    icon: "FileText",
    orderIndex: 9,
    isEnabled: true,
  },

  // Growth & Finance Hub
  {
    key: "bookmarks",
    name: "Resources",
    path: "/bookmarks",
    hub: "Growth & Finance",
    icon: "Bookmark",
    orderIndex: 10,
    isEnabled: true,
  },
  {
    key: "finance",
    name: "Finance",
    path: "/finance",
    hub: "Growth & Finance",
    icon: "DollarSign",
    orderIndex: 11,
    isEnabled: true,
    minRole: "user",
  },

  // System Hub (Admin & Ops)
  {
    key: "admin",
    name: "Admin Center",
    path: "/admin",
    hub: "System & Ops",
    icon: "ShieldAlert",
    orderIndex: 99,
    isEnabled: true,
    minRole: "admin",
  },
];

export async function ensurePagesSeeded() {
  try {
    for (const page of DEFAULT_APP_PAGES) {
      await db
        .insert(appPages)
        .values(page as any)
        .onConflictDoUpdate({
          target: appPages.key,
          set: {
            name: page.name,
            path: page.path,
            hub: page.hub,
            icon: page.icon,
            orderIndex: page.orderIndex,
            minRole: page.minRole || "user",
            minTier: (page as any).minTier || "free",
          },
        });
    }
  } catch (err) {
    console.error("Page seeding check:", err);
  }
}

export async function getAppPagesService(
  userRole: string = "user",
  _userTier: string = "free",
) {
  await ensurePagesSeeded();

  const allPages = await db
    .select({
      id: appPages.id,
      key: appPages.key,
      name: appPages.name,
      path: appPages.path,
      hub: appPages.hub,
      icon: appPages.icon,
      orderIndex: appPages.orderIndex,
      minRole: appPages.minRole,
      minTier: appPages.minTier,
    })
    .from(appPages)
    .where(eq(appPages.isEnabled, true))
    .orderBy(asc(appPages.orderIndex));

  return allPages.filter((page) => {
    const requiredRole = page.minRole || "user";
    if (requiredRole === "user") return true;
    if (requiredRole === "admin")
      return userRole === "admin" || userRole === "superadmin";
    if (requiredRole === "superadmin") return userRole === "superadmin";
    return false;
  });
}

export async function getAllAppPagesAdminService() {
  await ensurePagesSeeded();
  return db.select().from(appPages).orderBy(asc(appPages.orderIndex));
}
export async function createAppPageService(input: CreateAppPageInput) {
  const [created] = await db.insert(appPages).values(input).returning();
  return created;
}

export async function updateAppPageService(
  id: number,
  input: UpdateAppPageInput,
) {
  const [updated] = await db
    .update(appPages)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(appPages.id, id))
    .returning();

  if (!updated) {
    throw new NotFoundError("App page not found.");
  }

  return updated;
}

export async function toggleAppPageService(id: number) {
  const [target] = await db
    .select()
    .from(appPages)
    .where(eq(appPages.id, id))
    .limit(1);
  if (!target) {
    throw new NotFoundError("App page not found.");
  }

  const [updated] = await db
    .update(appPages)
    .set({ isEnabled: !target.isEnabled, updatedAt: new Date() })
    .where(eq(appPages.id, id))
    .returning();

  return updated;
}
