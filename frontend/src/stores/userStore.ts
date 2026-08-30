import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { ThemeMode, UserProfile, ActiveModuleId } from "@/lib/types";
import { authApi, usersApi } from "@/lib/api";
import { soundFX, triggerCelebrationConfetti } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export const INITIAL_USER: UserProfile = {
  name: "",
  avatar: "",
  title: "-",
  bio: "",
  theme: "dark",
  favorites: [],
  timezone: "UTC",
  notificationsEnabled: true,
  emailNotifications: true,
  soundEffects: true,
  role: "user",
  planTier: "free",
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  streak: 0,
  joinedDate: "",
};

export interface UserStoreState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  setIsAuthenticated: (val: boolean) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode, syncBackend?: boolean) => void;
  toggleTheme: () => void;
  login: (user?: string, pass?: string) => boolean;
  logout: () => void;
  syncWithBackend: () => Promise<void>;

  user: UserProfile;
  setUser: (user: UserProfile) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  toggleFavorite: (moduleId: ActiveModuleId) => void;
  addXP: (amount: number) => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isCheckingAuth: true,
      setIsAuthenticated: (val: boolean) =>
        set({ isAuthenticated: val, isCheckingAuth: false }),

      theme: "dark",
      setTheme: (themeMode, syncBackend = true) => {
        set((state) => ({
          theme: themeMode,
          user: { ...state.user, theme: themeMode },
        }));
        if (typeof window !== "undefined") {
          localStorage.setItem("trymonk_theme", themeMode);
          const root = document.documentElement;
          if (themeMode === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
            root.style.colorScheme = "dark";
          } else {
            root.classList.remove("dark");
            root.classList.add("light");
            root.style.colorScheme = "light";
          }
          root.setAttribute("data-theme", themeMode);
        }
        if (syncBackend) {
          usersApi
            .updateProfile({ theme: themeMode })
            .catch(() => {});
        }
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        get().setTheme(next, true);
      },

      login: () => {
        set({ isAuthenticated: true, isCheckingAuth: false });
        return true;
      },

      logout: async () => {
        const refreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem("trymonk_refresh_token") ||
              localStorage.getItem("aura_refresh_token") ||
              undefined
            : undefined;

        if (typeof window !== "undefined") {
          localStorage.removeItem("trymonk_token");
          localStorage.removeItem("trymonk_access_token");
          localStorage.removeItem("trymonk_refresh_token");
          localStorage.removeItem("aura_access_token");
          localStorage.removeItem("aura_refresh_token");
          localStorage.removeItem("trymonk_user_store");
        }

        set({
          isAuthenticated: false,
          isCheckingAuth: false,
          user: INITIAL_USER,
        });

        try {
          await authApi.logout(refreshToken);
        } catch {
          // ignore network errors on logout
        }

        toast.info("Logged out successfully.");
      },

      user: INITIAL_USER,
      setUser: (user: UserProfile) => set({ user }),

      updateUserProfile: (data: Partial<UserProfile>) => {
        const current = get().user;
        const updated = { ...current, ...data };
        set({
          user: updated,
          ...(data.theme ? { theme: data.theme } : {}),
        });

        if (data.theme) {
          get().setTheme(data.theme, false);
        }

        usersApi
          .updateProfile({
            name: data.name,
            title: data.title,
            bio: data.bio,
            avatar: data.avatar,
            timezone: data.timezone,
            theme: data.theme,
            favorites: data.favorites,
            notificationsEnabled: data.notificationsEnabled,
            emailNotifications: data.emailNotifications,
            soundEffects: data.soundEffects,
          })
          .catch(() => {});
      },

      toggleFavorite: (moduleId: ActiveModuleId) => {
        const current = get().user?.favorites || [];
        const exists = current.includes(moduleId);
        const updated = exists
          ? current.filter((id) => id !== moduleId)
          : [...current, moduleId];

        set((state) => ({
          user: { ...state.user, favorites: updated },
        }));

        usersApi.updateProfile({ favorites: updated }).catch(() => {});
      },

      addXP: (amount: number) => {
        const current = get().user;
        const newXP = current.xp + amount;
        let newLevel = current.level;
        let newTarget = current.xpToNextLevel;

        if (newXP >= newTarget) {
          newLevel += 1;
          newTarget = Math.floor(1000 * Math.pow(1.3, newLevel - 1));
          soundFX.playCheckSound();
          triggerCelebrationConfetti();
          toast.success(`Level Up! You reached Level ${newLevel}`);
        }

        set({
          user: {
            ...current,
            xp: newXP,
            level: newLevel,
            xpToNextLevel: newTarget,
          },
        });
      },

      syncWithBackend: async () => {
        try {
          const profileRes = await authApi.getMe().catch(() => null);
          if (profileRes?.data?.data) {
            const u = profileRes.data.data;

            const userTheme =
              u.theme === "light" || u.theme === "dark" ? u.theme : get().theme;
            get().setTheme(userTheme, false);

            set({
              isAuthenticated: true,
              isCheckingAuth: false,
              user: {
                name: u.name || "",
                avatar: u.avatar || "",
                title: u.title || "-",
                bio: u.bio || "",
                theme: userTheme,
                favorites: u.favorites || [],
                timezone: u.timezone || "UTC",
                notificationsEnabled: u.notificationsEnabled ?? true,
                emailNotifications: u.emailNotifications ?? true,
                soundEffects: u.soundEffects ?? true,
                role: u.role || "user",
                planTier: u.planTier || "free",
                level: u.level || 1,
                xp: u.xp || 0,
                xpToNextLevel: Math.floor(
                  1000 * Math.pow(1.3, (u.level || 1) - 1),
                ),
                streak: u.streak || 0,
                joinedDate: u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent",
              },
            });
          } else {
            set({ isAuthenticated: false, isCheckingAuth: false });
          }
        } catch {
          set({ isAuthenticated: false, isCheckingAuth: false });
        }
      },
    }),
    {
      name: "trymonk_user_store",
      storage: createEncryptedStorage(),
    },
  ),
);
