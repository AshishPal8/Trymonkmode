'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  Star,
  Lock,
  Unlock,
  Send,
  Calendar,
  Heart,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Check,
  Sparkles,
  Shuffle,
  Flame
} from 'lucide-react';
import { formatDatePretty, getTodayDateString } from '@/lib/utils';
import { MoodType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ModuleContainer } from '@/components/layout/ModuleContainer';

type JournalTemplateId = 'lined-notebook' | 'bullet-grid' | 'stoic-reflection' | 'creative-scrapbook';

const DAILY_PROMPTS = [
  'What is one hard truth you embraced today that made you wiser?',
  'Where did you experience unexpected joy or peak flow today?',
  'If you could re-live one moment from today, which would you pick and why?',
  'What small win are you most proud of achieving today?',
  'What did you do today that brought you closer to your long-term vision?',
  'What is one limiting belief or stressor you let go of today?',
  'What is a key lesson today taught you about patience or discipline?',
  'How did you show kindness to yourself or someone else today?',
  'What is the most energizing conversation or insight you gained today?',
  'What is one exciting milestone you look forward to conquering tomorrow?'
];

export function JournalView() {
  const { journalEntries, addJournalEntry, user } = useApp();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTemplate, setActiveTemplate] = useState<JournalTemplateId>('lined-notebook');
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const currentEntry = journalEntries.find(e => e.date === selectedDate);

  // Form State
  const [selectedMood, setSelectedMood] = useState<MoodType>(currentEntry?.mood || 'ecstatic');
  const [rating, setRating] = useState<number>(currentEntry?.rating || 5);
  const [howWasDay, setHowWasDay] = useState(
    currentEntry?.howWasYourDay ||
    'Achieved high velocity on project architecture and stayed in deep flow all morning.'
  );
  const [gratitude1, setGratitude1] = useState(currentEntry?.gratitude[0] || 'The opportunity to build great software');
  const [gratitude2, setGratitude2] = useState(currentEntry?.gratitude[1] || 'Vibrant health and sharp mental focus ✨');
  const [achievement, setAchievement] = useState(
    currentEntry?.proudestAchievement || 'Mastered distributed queue architectures with zero build errors.'
  );
  const [affirmation, setAffirmation] = useState(
    currentEntry?.affirmation || 'I am focused, resilient, and creating meaningful work 🌿'
  );
  const [selectedStickers, setSelectedStickers] = useState<string[]>(currentEntry?.stickers || ['star', 'coffee']);
  const [promptIndex, setPromptIndex] = useState(0);
  const [dailyPromptAnswer, setDailyPromptAnswer] = useState(
    currentEntry?.dailyPromptAnswer || 'Learned to prioritize deep uninterrupted execution over shallow urgency.'
  );
  const [isLocked, setIsLocked] = useState(false);

  const currentPrompt = currentEntry?.dailyPrompt || DAILY_PROMPTS[promptIndex % DAILY_PROMPTS.length];

  const handleShufflePrompt = () => {
    setPromptIndex(prev => (prev + 1) % DAILY_PROMPTS.length);
  };

  // Date navigation handlers
  const navigateDay = (offset: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    const newDateStr = current.toISOString().split('T')[0];
    handleDateSelect(newDateStr);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setCurrentPage(1);
    const entry = journalEntries.find(e => e.date === dateStr);
    if (entry) {
      setSelectedMood(entry.mood);
      setRating(entry.rating);
      setHowWasDay(entry.howWasYourDay);
      setGratitude1(entry.gratitude[0] || '');
      setGratitude2(entry.gratitude[1] || '');
      setAchievement(entry.proudestAchievement || '');
      setAffirmation(entry.affirmation || '');
      setSelectedStickers(entry.stickers || ['star']);
      setDailyPromptAnswer(entry.dailyPromptAnswer || '');
      setIsLocked(entry.isLocked || false);
    } else {
      setHowWasDay('');
      setGratitude1('');
      setGratitude2('');
      setAchievement('');
      setAffirmation('I am focused, resilient, and creating meaningful work 🌿');
      setSelectedStickers(['star']);
      setDailyPromptAnswer('');
      setIsLocked(false);
    }
  };

  const toggleSticker = (sticker: string) => {
    if (selectedStickers.includes(sticker)) {
      setSelectedStickers(prev => prev.filter(s => s !== sticker));
    } else {
      setSelectedStickers(prev => [...prev, sticker]);
    }
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    addJournalEntry({
      date: selectedDate,
      mood: selectedMood,
      rating,
      howWasYourDay: howWasDay || 'Reflected on the day with calm mindfulness.',
      highlights: achievement || 'Completed daily objectives.',
      gratitude: [gratitude1, gratitude2].filter(Boolean),
      proudestAchievement: achievement,
      tomorrowPriority: 'Execute high-leverage deliverables.',
      stickers: selectedStickers,
      affirmation: affirmation,
      dailyPrompt: currentPrompt,
      dailyPromptAnswer: dailyPromptAnswer,
      isLocked
    });



    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 4000);
  };

  // Compact 7-day strip
  const getWeekDates = () => {
    const dates = [];
    const target = new Date(selectedDate);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(target);
      d.setDate(target.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const hasEntry = journalEntries.some(e => e.date === dateStr);
      dates.push({ dateStr, dayName, dayNumber, isToday: dateStr === todayStr, hasEntry });
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const templates: { id: JournalTemplateId; label: string; icon: string; desc: string }[] = [
    { id: 'lined-notebook', label: 'Lined Notebook', icon: '📖', desc: 'Classic ruled A4 paper with spiral binding' },
    { id: 'bullet-grid', label: 'Bullet Dot Grid', icon: '🌿', desc: 'Dot grid paper with washi tapes' },
    { id: 'stoic-reflection', label: 'Stoic Mindset', icon: '🧘', desc: 'Structured morning & evening prompts' },
    { id: 'creative-scrapbook', label: 'Creative Scrapbook', icon: '☕', desc: 'Aesthetic moodboard with stickers' }
  ];

  const moodList: { id: MoodType; emoji: string; label: string }[] = [
    { id: 'ecstatic', emoji: '🤩', label: 'Ecstatic' },
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'down', emoji: '😔', label: 'Low' },
    { id: 'stressed', emoji: '😤', label: 'Stressed' }
  ];

  return (
    <ModuleContainer>
      {/* 1. Header with Consistent Width & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Daily Journal
          </h1>
          <p className="text-xs text-muted-foreground">
            {formatDatePretty(selectedDate)} · {templates.find(t => t.id === activeTemplate)?.label} · A4 Stationery Sheet
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Day Navigation Buttons */}
          <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl shadow-sm">
            <button
              onClick={() => navigateDay(-1)}
              title="Previous Day"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDateSelect(todayStr)}
              className="px-2.5 py-0.5 text-[11px] font-bold text-[#0052FF] hover:bg-[#0052FF]/10 rounded-lg transition cursor-pointer"
            >
              Today
            </button>

            <button
              onClick={() => navigateDay(1)}
              title="Next Day"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Template Menu (3-dots Dropdown) */}
          <div className="relative">
            <button
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition cursor-pointer shadow-sm text-card-foreground"
            >
              <span>{templates.find(t => t.id === activeTemplate)?.icon}</span>
              <span className="hidden sm:inline">{templates.find(t => t.id === activeTemplate)?.label}</span>
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {showTemplateMenu && (
              <div className="absolute right-0 mt-2 w-56 p-2 bg-card border border-border rounded-xl shadow-2xl z-50 animate-fadeIn text-xs space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase block">
                  Select Template
                </span>
                {templates.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setActiveTemplate(tpl.id);
                      setShowTemplateMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer ${activeTemplate === tpl.id
                      ? 'bg-[#0052FF]/10 text-[#0052FF] font-bold'
                      : 'hover:bg-muted text-card-foreground'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{tpl.icon}</span>
                      <span>{tpl.label}</span>
                    </div>
                    {activeTemplate === tpl.id && <Check className="w-3.5 h-3.5 text-[#0052FF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lock / Unlock */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className="p-2 rounded-xl border border-border bg-card text-xs font-semibold flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground shadow-sm"
            title={isLocked ? 'Encrypted' : 'Unlocked'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-rose-500" /> : <Unlock className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>

          {/* Vault Toggle */}
          <Button
            onClick={() => {
              setShowVault(!showVault);
              setShowTemplateMenu(false);
            }}
            className="bg-card text-card-foreground border border-border hover:bg-muted rounded-xl text-xs font-semibold px-3 py-1.5 h-auto cursor-pointer shadow-sm"
          >
            {showVault ? 'Write Entry' : `Vault (${journalEntries.length})`}
          </Button>
        </div>
      </div>

      {/* 2. Compact Slim Date Strip (Hidden when in Vault view) */}
      {!showVault && (
        <div className="px-3 py-1.5 rounded-2xl ios-card flex items-center justify-between gap-1 overflow-x-auto">
          {weekDates.map(item => {
            const isSelected = selectedDate === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => handleDateSelect(item.dateStr)}
                className={`flex-1 py-1 px-1 rounded-xl transition cursor-pointer flex flex-col items-center justify-center min-w-[44px] ${isSelected
                  ? 'bg-[#0052FF] text-white font-bold shadow-sm'
                  : item.isToday
                    ? 'bg-[#0052FF]/10 text-[#0052FF] font-bold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <span className="text-[9px] uppercase font-bold tracking-wider">{item.dayName}</span>
                <span className="text-xs font-bold leading-none mt-0.5">{item.dayNumber}</span>
                {item.hasEntry && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Main A4 Sheet Canvas */}
      {!showVault ? (
        <form onSubmit={handleSaveJournal} className="space-y-4">
          <div className="a4-sheet-canvas rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden transition-all duration-300 flex flex-col justify-between">
            {/* Luxury Twin-Ring Wire-O Spring Binding */}
            <div className="flex flex-col justify-between absolute left-1 sm:left-2 top-6 sm:top-8 bottom-6 sm:bottom-8 w-7 sm:w-8 pointer-events-none z-20">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="relative flex items-center h-8 sm:h-9">
                  {/* Vertical Binder Pill Punch Hole */}
                  <div className="w-2.5 sm:w-3 h-6 sm:h-7 rounded-full bg-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] border border-zinc-700/50 flex flex-col justify-around py-0.5 items-center relative z-10" />

                  {/* Curved 3D Twin Wire Loops entering directly into the punch hole */}
                  <div className="absolute -left-3.5 sm:-left-4 flex flex-col gap-1 z-20">
                    {/* Top Ring Loop */}
                    <svg className="w-7 sm:w-8 h-2 overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]" viewBox="0 0 32 10" fill="none">
                      <defs>
                        <linearGradient id={`wire-curve-1-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#71717a" />
                          <stop offset="30%" stopColor="#ffffff" />
                          <stop offset="70%" stopColor="#a1a1aa" />
                          <stop offset="100%" stopColor="#27272a" />
                        </linearGradient>
                      </defs>
                      <path d="M 2 4 C 12 4, 22 4, 28 6.5" stroke={`url(#wire-curve-1-${i})`} strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 4 3 C 12 3, 20 3, 25 4" stroke="rgba(255,255,255,0.9)" strokeWidth="1" strokeLinecap="round" />
                    </svg>

                    {/* Bottom Ring Loop */}
                    <svg className="w-7 sm:w-8 h-2 overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]" viewBox="0 0 32 10" fill="none">
                      <defs>
                        <linearGradient id={`wire-curve-2-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#71717a" />
                          <stop offset="30%" stopColor="#ffffff" />
                          <stop offset="70%" stopColor="#a1a1aa" />
                          <stop offset="100%" stopColor="#27272a" />
                        </linearGradient>
                      </defs>
                      <path d="M 2 4 C 12 4, 22 4, 28 6.5" stroke={`url(#wire-curve-2-${i})`} strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 4 3 C 12 3, 20 3, 25 4" stroke="rgba(255,255,255,0.9)" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Washi Tape Corner */}
            <div className="washi-tape washi-tape-yellow -top-2 right-12" />

            <div className="pl-3 sm:pl-6 space-y-5 sm:space-y-6 flex-1">
              {/* Sheet Header: Date + Rating + Mood & Page Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-handwriting font-bold tracking-wide">
                    {formatDatePretty(selectedDate)}
                  </h2>
                  <span className="text-[11px] font-sans font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                    Page {currentPage} of 2
                  </span>
                </div>

                {/* Star Day Rating & Page Turn Flip */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="cursor-pointer transition transform hover:scale-110"
                      >
                        <Star
                          className={`w-4 h-4 ${star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-muted-foreground/30'
                            }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 border-l border-border pl-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer transition ${currentPage === 1 ? 'bg-[#0052FF] text-white' : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                      P1
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(2)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer transition ${currentPage === 2 ? 'bg-[#0052FF] text-white' : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                      P2
                    </button>
                  </div>
                </div>
              </div>

              {/* Mood Selector Row */}
              <div className="grid grid-cols-5 gap-2 pb-2">
                {moodList.map(m => {
                  const isSelected = selectedMood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id)}
                      className={`py-2 px-2 rounded-2xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-600 font-bold shadow-sm'
                        : 'bg-card/70 border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-xs font-handwriting hidden sm:inline">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* PAGE 1: Core Journaling Reflections */}
              {currentPage === 1 && (
                <div className="space-y-5">
                  {/* Daily Reflection Prompt Card (Streak Booster & XP Points Reward) */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0052FF]/5 to-purple-500/10 border border-amber-500/25 space-y-2 relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 font-sans">
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>Prompt of the Day</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleShufflePrompt}
                        title="Shuffle Daily Prompt"
                        className="px-2 py-1 rounded-lg bg-card/60 border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center gap-1 text-[11px] font-sans font-semibold"
                      >
                        <Shuffle className="w-3 h-3" />
                        <span>New Prompt</span>
                      </button>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-card-foreground italic font-sans leading-snug">
                      &ldquo;{currentPrompt}&rdquo;
                    </p>

                    <input
                      type="text"
                      value={dailyPromptAnswer}
                      onChange={e => setDailyPromptAnswer(e.target.value)}
                      placeholder="Write your daily prompt reflection here..."
                      className="w-full text-lg sm:text-xl font-handwriting bg-transparent focus:outline-none pt-1 border-t border-border/40 placeholder:text-muted-foreground/60 text-card-foreground"
                    />
                  </div>

                  {/* Template: Lined Notebook */}
                  {activeTemplate === 'lined-notebook' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 font-sans">
                          Thoughts & Flow of the Day:
                        </label>
                        <textarea
                          rows={7}
                          required
                          value={howWasDay}
                          onChange={e => setHowWasDay(e.target.value)}
                          placeholder="Write freely on the ruled A4 sheet lines..."
                          className="w-full journal-lined-paper text-xl sm:text-2xl font-handwriting focus:outline-none bg-transparent resize-none leading-[36px]"
                        />
                      </div>

                      {/* Gratitude & Highlights Strips */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 font-sans">
                            <Heart className="w-3.5 h-3.5" /> Gratitude
                          </span>
                          <input
                            type="text"
                            value={gratitude1}
                            onChange={e => setGratitude1(e.target.value)}
                            placeholder="1. The opportunity to build great software..."
                            className="w-full text-lg sm:text-xl font-handwriting bg-transparent border-b border-border focus:outline-none pb-1"
                          />
                          <input
                            type="text"
                            value={gratitude2}
                            onChange={e => setGratitude2(e.target.value)}
                            placeholder="2. Grateful for..."
                            className="w-full text-lg sm:text-xl font-handwriting bg-transparent border-b border-border focus:outline-none pb-1"
                          />
                        </div>

                        <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-2">
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-sans">
                            🏆 Proudest Achievement
                          </span>
                          <textarea
                            rows={3}
                            value={achievement}
                            onChange={e => setAchievement(e.target.value)}
                            placeholder="Mastered distributed queue architectures with zero build errors..."
                            className="w-full text-lg sm:text-xl font-handwriting bg-transparent focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Template: Bullet Dot Grid */}
                  {activeTemplate === 'bullet-grid' && (
                    <div className="journal-grid-paper p-6 rounded-2xl border border-border space-y-4">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-sans mb-1">
                          🌿 Bullet Log & Habit Reflections:
                        </span>
                        <textarea
                          rows={8}
                          value={howWasDay}
                          onChange={e => setHowWasDay(e.target.value)}
                          placeholder="• Morning sunlight routine complete&#10;• 90min deep focus session on distributed architecture&#10;• Evening workout & clear mind"
                          className="w-full bg-transparent text-xl sm:text-2xl font-handwriting focus:outline-none resize-none leading-relaxed"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#DCFCE7]/30 dark:bg-emerald-950/20 border border-emerald-500/30">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-sans block mb-1">
                          Daily Affirmation:
                        </span>
                        <input
                          type="text"
                          value={affirmation}
                          onChange={e => setAffirmation(e.target.value)}
                          className="w-full bg-transparent text-lg sm:text-xl font-handwriting focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Template: Stoic Mindset */}
                  {activeTemplate === 'stoic-reflection' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                        <span className="text-xs font-bold text-[#0052FF] uppercase font-sans">
                          ☀️ Morning Intention & Control
                        </span>
                        <textarea
                          rows={6}
                          value={howWasDay}
                          onChange={e => setHowWasDay(e.target.value)}
                          className="w-full bg-transparent text-lg sm:text-xl font-handwriting focus:outline-none resize-none"
                        />
                      </div>

                      <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                        <span className="text-xs font-bold text-amber-600 uppercase font-sans">
                          🌙 Evening Virtue Review
                        </span>
                        <textarea
                          rows={6}
                          value={achievement}
                          onChange={e => setAchievement(e.target.value)}
                          className="w-full bg-transparent text-lg sm:text-xl font-handwriting focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Template: Creative Scrapbook */}
                  {activeTemplate === 'creative-scrapbook' && (
                    <div className="p-6 rounded-2xl bg-[#FEF08A]/20 border border-yellow-300/40">
                      <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase font-sans block mb-1">
                        ☕ Creative Sparks & Ideas:
                      </span>
                      <textarea
                        rows={8}
                        value={howWasDay}
                        onChange={e => setHowWasDay(e.target.value)}
                        placeholder="Write your wildest ideas and creative breakthroughs..."
                        className="w-full bg-transparent text-xl sm:text-2xl font-handwriting focus:outline-none resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* PAGE 2: Stickers & Extra Reflection Notes */}
              {currentPage === 2 && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                    <span className="text-xs font-bold text-card-foreground uppercase tracking-wider font-sans block">
                      📝 Extended Notes & Learnings:
                    </span>
                    <textarea
                      rows={6}
                      value={affirmation}
                      onChange={e => setAffirmation(e.target.value)}
                      placeholder="Extra notes, book quotes, or personal reminders for tomorrow..."
                      className="w-full bg-transparent text-lg sm:text-xl font-handwriting focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 font-sans">
                      Stamps & Stickers for Today:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { id: 'star', label: '⭐ Star Win' },
                        { id: 'coffee', label: '☕ Lo-Fi Cafe' },
                        { id: 'joy', label: '💖 Pure Joy' },
                        { id: 'growth', label: '🌿 Growth' },
                        { id: 'spark', label: '💡 Idea' },
                        { id: 'fire', label: '🔥 Streak' }
                      ].map(st => {
                        const isChecked = selectedStickers.includes(st.id);
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => toggleSticker(st.id)}
                            className={`px-4 py-2 rounded-full text-base font-handwriting font-bold border transition cursor-pointer ${isChecked
                              ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-sm scale-105'
                              : 'bg-card border-border text-muted-foreground hover:text-foreground'
                              }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom A4 Sheet Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-border mt-6 pl-3 sm:pl-6 gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-muted-foreground font-mono">
                <span className="whitespace-nowrap">{howWasDay.length} chars</span>
                <span className="text-border">·</span>
                <div className="inline-flex items-center gap-1 text-amber-500 font-semibold whitespace-nowrap">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 shrink-0" />
                  <span>{user.streak}d Streak</span>
                </div>
              </div>

              <Button
                type="submit"
                className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#0052FF] hover:bg-[#0043D6] text-white font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Save Journal (+40 XP · Streak 🔥)</span>
              </Button>
            </div>
          </div>

          {/* Streak & XP Points Celebration Toast Popup */}
          {showSaveToast && (
            <div className="fixed top-20 right-4 sm:right-8 z-50 animate-bounce pointer-events-none">
              <div className="ios-card bg-card/95 border border-amber-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
                  <Flame className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-card-foreground flex items-center gap-1.5">
                    <span>Daily Streak Boosted! 🔥</span>
                    <span className="text-amber-500">+{user.streak} Days</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    +40 XP points awarded for journaling today!
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      ) : (
        /* 4. Vault View */
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-foreground">Archived Journal Vault</h3>
            <span className="text-xs text-muted-foreground font-mono">{journalEntries.length} entries</span>
          </div>

          <div className="space-y-3">
            {journalEntries.map(entry => (
              <div
                key={entry.id}
                onClick={() => {
                  handleDateSelect(entry.date);
                  setShowVault(false);
                }}
                className="p-5 rounded-2xl ios-card space-y-2 cursor-pointer hover:border-[#0052FF] transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-card-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0052FF]" />
                    {formatDatePretty(entry.date)}
                  </span>
                  <span className="text-xs text-amber-400">
                    {'★'.repeat(entry.rating)}
                  </span>
                </div>
                <p className="text-base sm:text-xl text-card-foreground font-handwriting leading-relaxed line-clamp-2">
                  &quot;{entry.howWasYourDay}&quot;
                </p>
                {entry.stickers && entry.stickers.length > 0 && (
                  <div className="flex gap-1.5 pt-1">
                    {entry.stickers.map((s, i) => (
                      <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-handwriting">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </ModuleContainer>
  );
}
