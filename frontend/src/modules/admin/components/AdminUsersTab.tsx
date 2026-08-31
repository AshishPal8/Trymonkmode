"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Flame,
} from "lucide-react";

export interface AdminUserRecord {
  id: number;
  email: string;
  name: string;
  avatar?: string | null;
  role: "superadmin" | "admin" | "user";
  planTier: "free" | "pro" | "ai_ultra" | "lifetime";
  level: number;
  xp: number;
  streak: number;
  createdAt: string;
}

interface AdminUsersTabProps {
  usersList: AdminUserRecord[];
  isLoading: boolean;
  onUpdateRoleTier: (
    userId: number,
    data: { role?: string; planTier?: string },
  ) => Promise<void>;
}

export function AdminUsersTab({
  usersList,
  isLoading,
  onUpdateRoleTier,
}: AdminUsersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesTier = tierFilter === "all" || u.planTier === tierFilter;

      return matchesSearch && matchesRole && matchesTier;
    });
  }, [usersList, searchQuery, roleFilter, tierFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  return (
    <div className="space-y-3 animate-in fade-in-50 duration-200">
      {/* Search & Select Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <Input
          leftIcon={<Search className="w-3.5 h-3.5" />}
          placeholder="Search user name or email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          onClear={() => setSearchQuery("")}
          containerClassName="w-full sm:w-72"
        />

        <div className="flex items-center gap-2">
          <div className="w-32 sm:w-36">
            <CustomSelect
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "All Roles" },
                { value: "superadmin", label: "Superadmin" },
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
              ]}
            />
          </div>

          <div className="w-32 sm:w-36">
            <CustomSelect
              value={tierFilter}
              onChange={(val) => {
                setTierFilter(val);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "All Tiers" },
                { value: "lifetime", label: "Lifetime" },
                { value: "pro", label: "Pro" },
                { value: "free", label: "Free" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Unified Liquid Glass Table */}
      <div className="rounded-3xl ios-card bg-card border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border font-bold">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Plan Tier</th>
                <th className="px-5 py-3.5">Streak & Level</th>
                <th className="px-5 py-3.5">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                      <span>Loading users directory...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No users match the current search or filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* User Identity */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xs shrink-0 overflow-hidden">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (u.name || u.email || "U")
                              .slice(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {u.name || "Monk User"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role || "user"}
                        onChange={(e) =>
                          onUpdateRoleTier(u.id, {
                            role: e.target.value,
                          })
                        }
                        className="bg-muted/60 border border-border rounded-xl px-2.5 py-1 text-xs text-foreground font-medium cursor-pointer focus:outline-none focus:border-primary transition"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">👑 Superadmin</option>
                      </select>
                    </td>

                    {/* Plan Tier Dropdown */}
                    <td className="px-5 py-3.5">
                      <select
                        value={u.planTier || "free"}
                        onChange={(e) =>
                          onUpdateRoleTier(u.id, {
                            planTier: e.target.value,
                          })
                        }
                        className="bg-muted/60 border border-border rounded-xl px-2.5 py-1 text-xs text-foreground font-medium cursor-pointer focus:outline-none focus:border-primary transition"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro Plan</option>
                        <option value="lifetime">⭐ Lifetime Access</option>
                      </select>
                    </td>

                    {/* Stats */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          {u.streak || 0}d
                        </span>
                        <span className="text-muted-foreground">
                          • Lvl {u.level || 1} ({u.xp || 0} XP)
                        </span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-5 py-3 bg-muted/20 border-t border-border text-xs text-muted-foreground">
          <span>
            Showing {paginatedUsers.length} of {filteredUsers.length} users
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
