'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, Flame, Shield } from 'lucide-react';

export function LandingPreview({ onOpenAuth }: { onOpenAuth: (mode: 'login' | 'signup') => void }) {
  const [activePreviewTab, setActivePreviewTab] = useState<'focus' | 'tasks' | 'habits'>('focus');
  const [previewTimerSeconds, setPreviewTimerSeconds] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section id="preview" className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="p-8 sm:p-12 rounded-[40px] ios-card border border-white/20 dark:border-blue-500/30 shadow-2xl relative overflow-hidden space-y-8 backdrop-blur-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0052FF] dark:text-[#60A5FA]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try It Live Before Signing Up</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
              Interactive Liquid Glass Canvas
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-muted/80 border border-border text-xs font-bold">
            {[
              { id: 'focus', label: 'Focus Timer' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'habits', label: 'Habits' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePreviewTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
                  activePreviewTab === tab.id
                    ? 'bg-[#0052FF] text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activePreviewTab === 'focus' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
            <div className="text-center md:text-left space-y-4">
              <h3 className="text-xl font-extrabold text-foreground">Deep Work Sprint</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Experience frictionless time-boxing. Hit Start to initiate your focus cycle with subtle audio cues.
              </p>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold px-6 py-2 rounded-full cursor-pointer"
                >
                  {isTimerRunning ? 'Pause Sprint' : 'Start 25m Focus'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setPreviewTimerSeconds(1500);
                  }}
                  className="text-xs font-semibold px-4 py-2 rounded-full cursor-pointer"
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-56 h-56 rounded-full border-4 border-[#0052FF]/30 bg-[#0052FF]/10 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,82,255,0.2)] backdrop-blur-xl relative">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  {formatTimer(previewTimerSeconds)}
                </span>
                <span className="text-[11px] font-bold text-emerald-500 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Deep Sprint Active
                </span>
              </div>
            </div>
          </div>
        )}

        {activePreviewTab === 'tasks' && (
          <div className="space-y-3 py-2">
            {[
              { title: 'Finish Architecture Documentation', priority: 'P1', tag: 'Core', done: true },
              { title: 'Ship Winter Arc Landing Page', priority: 'P1', tag: 'Frontend', done: true },
              { title: '90m Deep Focus Sprints', priority: 'P2', tag: 'MonkMode', done: false },
            ].map((t, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-4 h-4 ${t.done ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-bold ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.title}</span>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-[#0052FF]/15 text-[#0052FF] text-[10px] font-bold">#{t.tag}</span>
              </div>
            ))}
          </div>
        )}

        {activePreviewTab === 'habits' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
            {[
              { title: 'Morning Workout', streak: 18, color: '#10B981' },
              { title: 'Read 10 Pages', streak: 12, color: '#0052FF' },
              { title: 'No Phone First Hour', streak: 7, color: '#8B5CF6' },
            ].map((h, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{h.title}</span>
                  <Flame className="w-4 h-4 text-amber-500 fill-current" />
                </div>
                <div className="text-xl font-extrabold" style={{ color: h.color }}>{h.streak} Days</div>
                <span className="text-[10px] font-semibold text-muted-foreground">100% On Schedule</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Full cloud synchronization and end-to-end local privacy</span>
          </div>
          <Button
            onClick={() => onOpenAuth('signup')}
            className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold px-6 py-2 rounded-full shadow-sm cursor-pointer"
          >
            Sign Up for Free
          </Button>
        </div>
      </div>
    </section>
  );
}