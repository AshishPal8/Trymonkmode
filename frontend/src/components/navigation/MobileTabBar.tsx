'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { ActiveModuleId } from '@/lib/types';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Plus,
  BookOpen,
  DollarSign,
  Grid,
  Clock,
  Zap,
  Smile,
  Calendar,
  Target,
  Bookmark,
  BarChart3,
  X
} from 'lucide-react';

export function MobileTabBar() {
  const { activeModule, setActiveModule, openQuickAdd } = useApp();
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  const allModules: { id: ActiveModuleId; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-[#0052FF]' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-[#3B82F6]' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-sky-500' },
    { id: 'matrix', label: 'Matrix', icon: Grid, color: 'text-amber-500' },
    { id: 'goals', label: 'Goals', icon: Target, color: 'text-emerald-500' },
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock, color: 'text-rose-500' },
    { id: 'habits', label: 'Habits', icon: Zap, color: 'text-amber-500' },
    { id: 'journal', label: 'Journal', icon: BookOpen, color: 'text-purple-500' },
    { id: 'notes', label: 'Notes', icon: FileText, color: 'text-blue-500' },
    { id: 'bookmarks', label: 'Resources', icon: Bookmark, color: 'text-indigo-500' },
    { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-emerald-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-cyan-500' }
  ];

  return (
    <>
      {/* Floating Bottom Nav (iOS Dock Look with Solid Liquid Glass Backdrop) */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-40">
        <nav className="flex items-center justify-around px-2 py-1.5 ios-card rounded-[26px] shadow-2xl border border-border bg-card/95 backdrop-blur-2xl">
          {/* Home */}
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer ${
              activeModule === 'dashboard'
                ? 'text-[#0052FF] font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">Home</span>
          </button>

          {/* Tasks */}
          <button
            onClick={() => setActiveModule('tasks')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer ${
              activeModule === 'tasks'
                ? 'text-[#0052FF] font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">Tasks</span>
          </button>

          {/* Center Plus Button */}
          <button
            onClick={openQuickAdd}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0052FF] hover:bg-[#0043D6] text-white shadow-md shadow-blue-500/30 transition transform active:scale-90 cursor-pointer"
            aria-label="Quick Add"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Journal */}
          <button
            onClick={() => setActiveModule('journal')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer ${
              activeModule === 'journal'
                ? 'text-[#0052FF] font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">Journal</span>
          </button>

          {/* All Modules Drawer */}
          <button
            onClick={() => setIsMoreDrawerOpen(true)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition cursor-pointer ${
              isMoreDrawerOpen
                ? 'text-[#0052FF] font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">Apps</span>
          </button>
        </nav>
      </div>

      {/* Full App Grid Drawer */}
      {isMoreDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col justify-end animate-fadeIn">
          <div className="ios-card rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto border-t border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-card-foreground">All Subsystems</h3>
                <p className="text-xs text-muted-foreground">Tap to switch module</p>
              </div>
              <button
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {allModules.map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveModule(mod.id);
                      setIsMoreDrawerOpen(false);
                    }}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition text-center cursor-pointer ${
                      isActive
                        ? 'border-[#0052FF] bg-[#0052FF]/10 text-[#0052FF] font-bold shadow-xs'
                        : 'border-border bg-muted/50 text-card-foreground hover:bg-muted'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mb-1.5 bg-card border border-border ${mod.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold truncate w-full">{mod.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
