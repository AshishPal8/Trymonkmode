"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { useTheme } from "@/hooks/useTheme";
import {
  Flame,
  Plus,
  Bell,
  LogOut,
  Search,
  Sun,
  Moon,
  Award,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuraLogo } from "../brand/AuraLogo";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "../ui/UserAvatar";

export function TopHeader() {
  const { user, activeModule, logout, openQuickAdd, openProfileModal } =
    useApp();
  const { theme, setTheme } = useTheme();

  const getModuleTitle = () => {
    switch (activeModule) {
      case "dashboard":
        return "Dashboard";
      case "tasks":
        return "Tasks";
      case "calendar":
        return "Calendar";
      case "matrix":
        return "Matrix";
      case "goals":
        return "Goals & OKRs";
      case "pomodoro":
      case "stopwatch":
        return "Focus Timer";
      case "habits":
        return "Habits";
      case "journal":
        return "Daily Journal";
      case "notes":
        return "Notes & Ideas";
      case "bookmarks":
        return "Resources";
      case "finance":
        return "Finance";
      case "analytics":
        return "Analytics";
      default:
        return "Dashboard";
    }
  };

  const displayName = user.name || "Member";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-8 py-2.5 sm:py-3.5 bg-card/90 backdrop-blur-md border-b border-border text-card-foreground transition-colors">
      {/* Left: Title & App Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <AuraLogo size="sm" showText={false} />
        <div>
          <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            {getModuleTitle()}
          </h1>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground -mt-0.5">
            TryMonkMode
          </p>
        </div>
      </div>

      {/* Center: Search Bar (Desktop Only) */}
      <div className="hidden md:flex items-center w-80">
        <Input
          leftIcon={<Search className="w-3.5 h-3.5" />}
          rightIcon={
            <span className="px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground bg-muted border border-border/80 rounded-md">
              ⌘K
            </span>
          }
          placeholder="Search anything..."
          className="bg-muted/60"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button */}
        <Button
          onClick={openQuickAdd}
          size="sm"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Add</span>
        </Button>

        {/* Notifications Dropdown */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:bg-muted rounded-xl cursor-pointer"
              >
                <Bell className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 p-3.5 space-y-2 text-xs border border-white/10 shadow-2xl bg-card/95 backdrop-blur-xl"
            >
              <div className="font-bold text-foreground mb-1 flex items-center justify-between">
                <span>Notifications</span>
                <span className="text-[10px] text-primary font-semibold cursor-pointer">
                  Mark all
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-muted/40 text-foreground">
                  🔥 <strong>{user.streak}-Day Streak!</strong> You are in peak
                  flow state.
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-[#0052FF]">
                  🌱 <strong>Habits:</strong> Rituals tracking active today.
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-0.5 rounded-xl hover:bg-muted/70 transition cursor-pointer border border-transparent hover:border-border shrink-0 focus:outline-none"
            >
              <UserAvatar
                name={displayName}
                avatarUrl={user.avatar}
                size="sm"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 p-3 space-y-2.5 text-xs"
          >
            {/* User Header */}
            <div className="px-1 pb-1.5 border-b border-border/40">
              <p className="font-bold text-foreground text-sm tracking-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                {user.title || ""}
              </p>
            </div>

            {/* Streak & Level Highlights */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted/40 text-card-foreground font-bold text-xs">
                <Flame className="w-4 h-4 text-primary shrink-0" />
                <span>{user.streak}d streak</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted/40 text-card-foreground font-bold text-xs">
                <Award className="w-4 h-4 text-primary shrink-0" />
                <span>Lvl {user.level}</span>
              </div>
            </div>

            {/* Profile & Settings Button */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={openProfileModal}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-muted/40 hover:bg-muted/70 text-card-foreground transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-primary" />
                  <span>Profile & Preferences</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-primary">
                  Edit
                </span>
              </button>
            </div>

            {/* Theme Mode Switcher */}
            <div className="pt-1.5 border-t border-border/40">
              <div className="text-[10px] font-bold text-muted-foreground uppercase px-1 mb-1.5 tracking-wider">
                Theme Mode
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    theme === "light"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    theme === "dark"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <div className="pt-1 border-t border-border/40">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
