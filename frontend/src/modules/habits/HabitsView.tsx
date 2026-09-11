'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  Plus,
  Flame,
  CheckCircle2,
  Zap,
  Droplet,
  BookOpen,
  Activity,
  Heart,
  Briefcase,
  Trash2,
  Sparkles,
  Pencil
} from 'lucide-react';
import { formatDatePretty, getTodayDateString } from '@/lib/utils';
import { HabitItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ModuleContainer } from '@/components/layout/ModuleContainer';
import { CustomSelect } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';

interface HabitFormData {
  title: string;
  description: string;
  category: HabitItem['category'];
  priority: HabitItem['priority'];
  timeFrom: string;
  timeTo: string;
  icon: string;
}

const INITIAL_HABIT_FORM: HabitFormData = {
  title: '',
  description: '',
  category: 'Health',
  priority: 'high',
  timeFrom: '07:00',
  timeTo: '07:30',
  icon: 'Zap',
};

export function HabitsView() {
  const { habits, addHabit, updateHabit, toggleHabitForDate, deleteHabit } = useApp();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Single Unified Modal State & Form Object State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);
  const [habitForm, setHabitForm] = useState<HabitFormData>(INITIAL_HABIT_FORM);

  const updateFormField = <K extends keyof HabitFormData>(
    key: K,
    value: HabitFormData[K]
  ) => {
    setHabitForm((prev) => ({ ...prev, [key]: value }));
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 7-day rolling strip
  const getDaysArray = () => {
    const arr = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      arr.push({
        dateStr,
        dayName: daysOfWeek[d.getDay()],
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr
      });
    }
    return arr;
  };

  const rollingDays = getDaysArray();

  const openCreateModal = () => {
    setEditingHabit(null);
    setHabitForm(INITIAL_HABIT_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (habit: HabitItem) => {
    setEditingHabit(habit);
    setHabitForm({
      title: habit.title,
      description: habit.description || '',
      category: habit.category,
      priority: habit.priority,
      timeFrom: habit.timeFrom,
      timeTo: habit.timeTo,
      icon: habit.icon,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitForm.title.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        title: habitForm.title.trim(),
        description: habitForm.description.trim() || undefined,
        category: habitForm.category,
        priority: habitForm.priority,
        timeFrom: habitForm.timeFrom,
        timeTo: habitForm.timeTo,
        icon: habitForm.icon,
      });
    } else {
      addHabit({
        title: habitForm.title.trim(),
        description: habitForm.description.trim() || undefined,
        category: habitForm.category,
        priority: habitForm.priority,
        timeFrom: habitForm.timeFrom,
        timeTo: habitForm.timeTo,
        icon: habitForm.icon,
        color: '#0052FF',
        targetDays: [0, 1, 2, 3, 4, 5, 6]
      });
    }

    closeModal();
  };

  const getCategoryIcon = (ic: string) => {
    switch (ic) {
      case 'Droplet': return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'Activity': return <Activity className="w-4 h-4 text-pink-500" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4 text-amber-500" />;
      case 'Zap':
      default: return <Zap className="w-4 h-4 text-emerald-500" />;
    }
  };

  const completedCount = habits.filter(h => h.completedDates.includes(selectedDate)).length;
  const habitCompletionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <ModuleContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Habits & Daily Consistency
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Lock in non-negotiable daily protocols and build unbroken consistency streaks
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-sm transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Habit</span>
        </Button>
      </div>

      {/* Rolling 7-Day Consistency Date Strip */}
      <div className="p-2 sm:p-3 rounded-2xl ios-card">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {rollingDays.map(item => {
            const isSelected = selectedDate === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`py-2 px-1 rounded-xl transition cursor-pointer flex flex-col items-center ${
                  isSelected
                    ? 'bg-[#0052FF] text-white font-semibold shadow-sm'
                    : item.isToday
                    ? 'bg-[#0052FF]/10 text-[#0052FF] font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="text-[10px] uppercase font-bold">{item.dayName}</span>
                <span className="text-sm font-bold mt-0.5">{item.dayNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Score Bar */}
      <div className="p-4 rounded-2xl ios-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-card-foreground">
              {completedCount} of {habits.length} Habits Completed
            </h3>
            <p className="text-[11px] text-muted-foreground">{formatDatePretty(selectedDate)}</p>
          </div>
        </div>

        <div className="text-sm font-bold font-mono text-card-foreground">
          {habitCompletionRate}%
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-2.5">
        {habits.length === 0 ? (
          <div className="p-12 text-center rounded-3xl ios-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">No Habits Tracked Yet</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Define your core daily rituals (e.g. Cold Shower, 90m Deep Work, Gym) to begin tracking streaks.
              </p>
            </div>
            <Button
              type="button"
              onClick={openCreateModal}
              className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-sm cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Habit</span>
            </Button>
          </div>
        ) : (
          habits.map(habit => {
            const isDone = habit.completedDates.includes(selectedDate);
            return (
              <div
                key={habit.id}
                className={`p-3.5 sm:p-4 rounded-2xl ios-card transition flex items-center justify-between gap-3 hover:border-primary/30 ${
                  isDone ? 'opacity-50' : ''
                }`}
              >
                {/* Left: Circular Checkbox + Icon + Title/Details */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleHabitForDate(habit.id, selectedDate)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
                      isDone
                        ? 'bg-[#22C55E] text-white'
                        : 'border-2 border-muted-foreground hover:border-[#0052FF]'
                    }`}
                    aria-label="Toggle habit completion"
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                  </button>

                  <div className="p-2 rounded-xl bg-muted shrink-0">
                    {getCategoryIcon(habit.icon)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isDone ? 'line-through text-muted-foreground' : 'text-card-foreground'
                        }`}
                      >
                        {habit.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-semibold text-muted-foreground">
                        {habit.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground mt-0.5">
                      <span className="font-mono">
                        {habit.timeFrom} - {habit.timeTo}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{habit.streak}d streak</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Edit & Delete Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditModal(habit)}
                    className="p-1.5 text-muted-foreground hover:text-[#0052FF] hover:bg-[#0052FF]/10 rounded-lg transition cursor-pointer"
                    aria-label="Edit habit"
                    title="Edit Habit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                    aria-label="Delete habit"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SINGLE UNIFIED ADD / EDIT HABIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingHabit ? "Edit Daily Habit" : "Add Daily Habit"}
        description={
          editingHabit
            ? "Update habit rituals, schedules, and categories."
            : "Establish non-negotiable rituals and build long-term momentum."
        }
        icon={
          editingHabit ? (
            <Pencil className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )
        }
        topAccentColor="#0052FF"
        maxWidth="md"
      >
        <form onSubmit={handleSaveHabit} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Habit Title *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. 90 Minutes Deep Work Session"
              value={habitForm.title}
              onChange={(e) => updateFormField("title", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Description
            </label>
            <Input
              type="text"
              placeholder="e.g. High-velocity uninterrupted coding"
              value={habitForm.description}
              onChange={(e) => updateFormField("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Category
              </label>
              <CustomSelect
                value={habitForm.category}
                onChange={(val) =>
                  updateFormField("category", val as HabitItem["category"])
                }
                options={[
                  { value: "Work", label: "Work" },
                  { value: "Health", label: "Health" },
                  { value: "Fitness", label: "Fitness" },
                  { value: "Mindset", label: "Mindset" },
                  { value: "Learning", label: "Learning" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Icon
              </label>
              <CustomSelect
                value={habitForm.icon}
                onChange={(val) => updateFormField("icon", val)}
                options={[
                  { value: "Zap", label: "⚡ Energy" },
                  { value: "Droplet", label: "💧 Water/Hydration" },
                  { value: "Activity", label: "🏃 Fitness" },
                  { value: "BookOpen", label: "📖 Reading" },
                  { value: "Heart", label: "❤️ Health" },
                  { value: "Briefcase", label: "💼 Work" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={habitForm.timeFrom}
                onChange={(e) => updateFormField("timeFrom", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                End Time
              </label>
              <input
                type="time"
                value={habitForm.timeTo}
                onChange={(e) => updateFormField("timeTo", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground font-mono transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-5 py-2 shadow-sm cursor-pointer"
            >
              {editingHabit ? "Save Changes" : "Add Habit"}
            </Button>
          </div>
        </form>
      </Modal>
    </ModuleContainer>
  );
}