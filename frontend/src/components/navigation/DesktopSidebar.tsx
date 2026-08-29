'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { ActiveModuleId } from '@/lib/types';
import { AuraLogo } from '../brand/AuraLogo';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Grid,
  Target,
  Clock,
  Zap,
  BookOpen,
  Smile,
  Bookmark,
  DollarSign,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Flame,
  Star,
  MoreVertical,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '../ui/UserAvatar';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Grid,
  Target,
  Clock,
  Zap,
  BookOpen,
  Smile,
  Bookmark,
  DollarSign,
  FileText,
};

export function DesktopSidebar() {
  const {
    pages,
    activeModule,
    setActiveModule,
    tasks,
    user,
    toggleFavorite,
    openProfileModal
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load persistence for sidebar collapsed state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trymonk_sidebar_collapsed') || localStorage.getItem('aura_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (e) { }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('trymonk_sidebar_collapsed', String(next));
      } catch (e) { }
      return next;
    });
  };

  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const userFavorites = user.favorites || [];

  const groupedHubs = useMemo(() => {
    const hubOrder = ['Productivity', 'Focus', 'Mind & Wellness', 'Growth & Finance'];
    const map = new Map<string, typeof pages>();

    hubOrder.forEach(h => map.set(h, []));

    pages.forEach(p => {
      const hubName = p.hub || 'Productivity';
      if (!map.has(hubName)) {
        map.set(hubName, []);
      }
      map.get(hubName)!.push(p);
    });

    return Array.from(map.entries())
      .filter(([_, items]) => items.length > 0)
      .map(([name, items]) => ({
        name,
        items: items.sort((a, b) => a.orderIndex - b.orderIndex)
      }));
  }, [pages]);

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-sidebar text-sidebar-foreground border-r border-border overflow-y-auto transition-all duration-300 ease-in-out z-30 ${isCollapsed ? 'w-[72px] px-2 py-4' : 'w-64 px-3.5 py-5'
        }`}
    >
      {/* Brand Header with Unified Top Toggle */}
      <div className={`flex items-center mb-5 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
        {!isCollapsed ? (
          <>
            <AuraLogo size="sm" subtitle="trymonkmode.in" />

            {/* Collapse Button */}
            <button
              onClick={toggleCollapse}
              title="Collapse Sidebar"
              className="p-1.5 rounded-xl hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          /* Collapsed Mode */
          <button
            onClick={toggleCollapse}
            title="Expand Sidebar"
            className="group relative flex items-center justify-center p-1 rounded-2xl hover:bg-sidebar-accent transition cursor-pointer"
          >
            <div className="group-hover:hidden">
              <AuraLogo size="sm" showText={false} />
            </div>
            <div className="hidden group-hover:flex items-center justify-center w-8 h-8 rounded-xl bg-sidebar-accent text-foreground">
              <PanelLeftOpen className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="space-y-4 flex-1">
        {userFavorites.length > 0 && (
          <div className="space-y-1 pb-3 mb-2 border-b border-border/70">
            {!isCollapsed ? (
              <div className="px-3 mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3 text-[#0052FF]" />
                <span>Favorites</span>
              </div>
            ) : (
              <div className="w-full flex justify-center py-1">
                <Star className="w-3 h-3 text-[#0052FF]" />
              </div>
            )}

            <div className="space-y-1">
              {userFavorites.map(favKey => {
                const pageItem = pages.find(p => p.key === favKey);
                if (!pageItem) return null;

                const Icon = ICON_MAP[pageItem.icon] || LayoutDashboard;
                const isActive = activeModule === pageItem.key;
                const badge = pageItem.key === 'tasks' && pendingTasksCount > 0 ? String(pendingTasksCount) : undefined;

                return (
                  <div key={`fav-${pageItem.key}`} className="relative group/fav">
                    <button
                      onClick={() => setActiveModule(pageItem.key)}
                      title={isCollapsed ? `${pageItem.name} (Favorite)` : undefined}
                      className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${isCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3 py-2.5'
                        } ${isActive
                          ? 'bg-[#0052FF] text-white shadow-md shadow-blue-500/25 font-bold'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#0052FF]'}`} />
                        {!isCollapsed && (
                          <span className={`truncate ${isActive ? 'text-white' : 'text-sidebar-foreground font-semibold'}`}>
                            {pageItem.name}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mr-4 group-hover/fav:mr-6 transition-all ${isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-muted text-foreground'
                            }`}
                        >
                          {badge}
                        </span>
                      )}

                      {/* Collapsed Dot Badge Indicator */}
                      {isCollapsed && badge && !isActive && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0052FF]" />
                      )}
                    </button>

                    {/* 3-Dot Menu for Favorites */}
                    {!isCollapsed && (
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/fav:opacity-100 transition">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className={`p-1 rounded-lg transition cursor-pointer ${isActive
                                ? 'text-white hover:bg-white/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                              title="Favorite Options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(pageItem.key);
                              }}
                              className="cursor-pointer flex items-center gap-2 text-rose-500 font-medium"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>Remove Favorite</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {groupedHubs.map((hub, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed ? (
              <div className="px-3 mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {hub.name}
              </div>
            ) : (
              <div className="w-full flex justify-center py-1">
                <div className="w-4 h-0.5 bg-border rounded-full" />
              </div>
            )}

            <div className="space-y-1">
              {hub.items.map(item => {
                const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                const isActive = activeModule === item.key;
                const isFavorited = userFavorites.includes(item.key);
                const badge = item.key === 'tasks' && pendingTasksCount > 0 ? String(pendingTasksCount) : undefined;

                return (
                  <div key={item.key} className="relative group">
                    <button
                      onClick={() => setActiveModule(item.key)}
                      title={isCollapsed ? `${item.name}${badge ? ` (${badge})` : ''}` : undefined}
                      className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${isCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3 py-2.5'
                        } ${isActive
                          ? 'bg-[#0052FF] text-white shadow-md shadow-blue-500/25 font-bold'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} />
                        {!isCollapsed && (
                          <span className={`truncate ${isActive ? 'text-white' : 'text-sidebar-foreground'}`}>
                            {item.name}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mr-4 group-hover:mr-6 transition-all ${isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-muted text-foreground'
                            }`}
                        >
                          {badge}
                        </span>
                      )}

                      {/* Collapsed Dot Badge Indicator */}
                      {isCollapsed && badge && !isActive && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0052FF]" />
                      )}
                    </button>

                    {/* 3-Dot Options Dropdown (Reveals on Hover) */}
                    {!isCollapsed && (
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className={`p-1 rounded-lg transition cursor-pointer ${isActive
                                ? 'text-white hover:bg-white/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                              title="Menu Options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs space-y-1">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(item.key);
                              }}
                              className="cursor-pointer flex items-center gap-2 font-medium"
                            >
                              <Star className={`w-3.5 h-3.5 ${isFavorited ? 'text-[#0052FF] fill-[#0052FF]' : 'text-muted-foreground'}`} />
                              <span>{isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Profile Footer */}
      {!isCollapsed && (
        <div className="mt-3 pt-2">
          <div
            onClick={openProfileModal}
            className="flex items-center justify-between p-2.5 rounded-2xl ios-card border border-border/80 hover:border-[#0052FF]/50 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <UserAvatar name={user.name || 'Member'} avatarUrl={user.avatar} size="sm" />
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-card-foreground block truncate group-hover:text-[#0052FF] transition">
                  {user.name || 'Member'}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#0052FF] inline" /> {user.streak || 0}d streak • Lvl {user.level || 1}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openProfileModal();
              }}
              className="p-1 rounded-lg text-muted-foreground group-hover:text-[#0052FF] transition"
              title="Settings & Profile"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}