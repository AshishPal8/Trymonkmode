"use client";

import React, { useState, useEffect } from "react";
import { usersApi, pagesApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { Button } from "@/components/ui/button";
import { AdminMetricCard } from "./components/AdminMetricCard";
import {
  AdminUsersTab,
  AdminUserRecord,
} from "./components/AdminUsersTab";
import {
  AdminPagesTab,
  AdminPageRecord,
} from "./components/AdminPagesTab";
import { AdminBlogsTab } from "./components/AdminBlogsTab";
import {
  Users,
  Layers,
  Crown,
  Flame,
  RefreshCw,
  Sparkles,
  BookOpen,
} from "lucide-react";

export function AdminView() {
  const [activeTab, setActiveTab] = useState<"users" | "pages" | "blogs">("users");

  // Users State
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Pages State
  const [pagesList, setPagesList] = useState<AdminPageRecord[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await usersApi.getAllUsers();
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setUsersList(res.data.data);
      }
    } catch {
      toast.error("Failed to fetch registered users.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch Admin Pages
  const fetchPages = async () => {
    setIsLoadingPages(true);
    try {
      const res = await pagesApi.getAllPagesAdmin();
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setPagesList(res.data.data);
      }
    } catch {
      toast.error("Failed to fetch system pages.");
    } finally {
      setIsLoadingPages(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "pages" && pagesList.length === 0) {
      fetchPages();
    }
  }, [activeTab]);

  // Update Role or Plan Tier
  const handleUpdateRoleTier = async (
    userId: number,
    data: { role?: string; planTier?: string },
  ) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId ? ({ ...u, ...data } as AdminUserRecord) : u,
      ),
    );

    try {
      await usersApi.updateRoleTier(userId, data);
      toast.success("User access updated successfully.");
    } catch {
      toast.error("Failed to update user permissions.");
      fetchUsers();
    }
  };

  // Toggle Page Visibility
  const handleTogglePage = async (pageId: number) => {
    setPagesList((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, isEnabled: !p.isEnabled } : p)),
    );

    try {
      await pagesApi.togglePage(pageId);
      toast.success("Page status updated.");
    } catch {
      toast.error("Failed to toggle module.");
      fetchPages();
    }
  };

  const superadminCount = usersList.filter((u) => u.role === "superadmin").length;
  const proCount = usersList.filter(
    (u) => u.planTier === "lifetime" || u.planTier === "pro",
  ).length;
  const totalStreaks = usersList.reduce((acc, u) => acc + (u.streak || 0), 0);

  return (
    <ModuleContainer className="space-y-6">
      {/* 1. Header with Sync Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Admin & System Ops
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage registered users, dynamic navigation modules, and SEO blog articles.
          </p>
        </div>

        <Button
          onClick={activeTab === "pages" ? fetchPages : fetchUsers}
          disabled={isLoadingUsers || isLoadingPages}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl px-4 py-2 shadow-xs transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isLoadingUsers || isLoadingPages ? "animate-spin" : ""
            }`}
          />
          <span>Sync Data</span>
        </Button>
      </div>

      {/* 2. Reusable Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AdminMetricCard
          title="Total Users"
          value={usersList.length}
          icon={Users}
          iconColor="text-primary"
        />
        <AdminMetricCard
          title="Superadmins"
          value={superadminCount}
          icon={Crown}
          iconColor="text-primary"
        />
        <AdminMetricCard
          title="Paid Members"
          value={proCount}
          icon={Sparkles}
          iconColor="text-emerald-500"
        />
        <AdminMetricCard
          title="Active Streaks"
          value={`${totalStreaks}🔥`}
          icon={Flame}
          iconColor="text-amber-500"
        />
      </div>

      {/* 3. App-Standard Pill Tabs Bar */}
      <div className="flex p-1 ios-card rounded-2xl bg-card border border-border overflow-x-auto w-fit">
        {[
          {
            id: "users",
            label: "User Directory",
            count: usersList.length,
            icon: Users,
          },
          {
            id: "pages",
            label: "App Modules CMS",
            count: pagesList.length > 0 ? pagesList.length : undefined,
            icon: Layers,
          },
          {
            id: "blogs",
            label: "Blog Articles CMS",
            count: undefined,
            icon: BookOpen,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Actionable Tab Views */}
      {activeTab === "users" && (
        <AdminUsersTab
          usersList={usersList}
          isLoading={isLoadingUsers}
          onUpdateRoleTier={handleUpdateRoleTier}
        />
      )}

      {activeTab === "pages" && (
        <AdminPagesTab
          pagesList={pagesList}
          isLoading={isLoadingPages}
          onTogglePage={handleTogglePage}
        />
      )}

      {activeTab === "blogs" && <AdminBlogsTab />}
    </ModuleContainer>
  );
}
