'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { X, CheckSquare, Zap, Calendar as CalendarIcon, DollarSign, Target, Bookmark, Sparkles, FileText, Check } from 'lucide-react';
import { getTodayDateString } from '@/lib/utils';
import { PriorityLevel, GoalItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/select';
import { CustomDatePicker } from '@/components/ui/date-picker';
import { CustomTimePicker } from '@/components/ui/time-picker';
import { Input } from '@/components/ui/input';
import { NOTE_COLORS } from '@/modules/notes/NotesView';

export function QuickAddModal() {
  const {
    isQuickAddOpen,
    closeQuickAdd,
    addTask,
    addHabit,
    addCalendarEvent,
    addTransaction,
    addGoal,
    addBookmark,
    addNote
  } = useApp();

  const [activeTab, setActiveTab] = useState<'task' | 'note' | 'habit' | 'event' | 'expense' | 'goal' | 'bookmark'>('task');

  // Task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('P1');
  const [taskDueDate, setTaskDueDate] = useState(getTodayDateString());
  const [taskDueTime, setTaskDueTime] = useState('12:00');
  const [taskCategory, setTaskCategory] = useState('Work');
  const [taskTags, setTaskTags] = useState('#Focus');

  // Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0].hex);

  // Habit state
  const [habitTitle, setHabitTitle] = useState('');
  const [habitTimeFrom, setHabitTimeFrom] = useState('07:00');
  const [habitTimeTo, setHabitTimeTo] = useState('07:30');
  const [habitCategory, setHabitCategory] = useState<'Fitness' | 'Health' | 'Mindset' | 'Learning' | 'Work'>('Health');

  // Calendar Event state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(getTodayDateString());
  const [eventStart, setEventStart] = useState('10:00');
  const [eventEnd, setEventEnd] = useState('11:00');
  const [eventCategory, setEventCategory] = useState<'deep-work' | 'meeting' | 'fitness' | 'personal' | 'learning'>('deep-work');

  // Expense state
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txCategory, setTxCategory] = useState<'Salary' | 'Food' | 'Transport' | 'Tech & Subscriptions' | 'Rent' | 'Health' | 'Shopping'>('Food');
  const [txDate, setTxDate] = useState(getTodayDateString());

  // Goal state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalItem['category']>('Career');
  const [goalTimeframe, setGoalTimeframe] = useState<GoalItem['timeframe']>('yearly');
  const [goalTargetMetric, setGoalTargetMetric] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('2026-12-31');
  const [goalMilestonesInput, setGoalMilestonesInput] = useState('');

  // Bookmark state
  const [bmTitle, setBmTitle] = useState('');
  const [bmUrl, setBmUrl] = useState('');
  const [bmCategory, setBmCategory] = useState<'Websites' | 'YouTube' | 'Articles' | 'GitHub' | 'Courses' | 'Books'>('Websites');

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'task' && taskTitle.trim()) {
      addTask({
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        dueDate: taskDueDate,
        dueTime: taskDueTime,
        category: taskCategory,
        tags: taskTags.split(' ').filter(t => t.startsWith('#') || t.length > 0),
        subtasks: [],
        completed: false,
        quadrant: taskPriority === 'P1' ? 'urgent-important' : 'notUrgent-important'
      });
      setTaskTitle('');
      setTaskDesc('');
    } else if (activeTab === 'note' && noteTitle.trim() && noteContent.trim()) {
      addNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        color: noteColor,
        isPinned: false,
        tags: ['#QuickNote']
      });
      setNoteTitle('');
      setNoteContent('');
    } else if (activeTab === 'habit' && habitTitle.trim()) {
      addHabit({
        title: habitTitle.trim(),
        timeFrom: habitTimeFrom,
        timeTo: habitTimeTo,
        priority: 'high',
        category: habitCategory,
        color: habitCategory === 'Fitness' ? '#EC4899' : habitCategory === 'Work' ? '#0052FF' : '#22C55E',
        icon: 'Zap',
        targetDays: [0, 1, 2, 3, 4, 5, 6]
      });
      setHabitTitle('');
    } else if (activeTab === 'event' && eventTitle.trim()) {
      const colors: Record<string, string> = {
        'deep-work': '#8B5CF6',
        meeting: '#0052FF',
        fitness: '#EC4899',
        personal: '#22C55E',
        learning: '#F59E0B'
      };
      addCalendarEvent({
        title: eventTitle.trim(),
        date: eventDate,
        startTime: eventStart,
        endTime: eventEnd,
        category: eventCategory,
        color: colors[eventCategory] || '#0052FF'
      });
      setEventTitle('');
    } else if (activeTab === 'expense' && txTitle.trim() && txAmount) {
      addTransaction({
        title: txTitle.trim(),
        amount: parseFloat(txAmount) || 0,
        category: txCategory,
        type: txType,
        date: txDate,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentMethod: 'Credit Card'
      });
      setTxTitle('');
      setTxAmount('');
      setTxDate(getTodayDateString());
    } else if (activeTab === 'goal' && goalTitle.trim()) {
      const parsedMilestones = goalMilestonesInput
        .split('\n')
        .map(m => m.trim())
        .filter(m => m.length > 0)
        .map((lineText, idx) => ({
          id: `gm-${Date.now()}-${idx}`,
          title: lineText,
          completed: false,
          progress: 0
        }));

      addGoal({
        title: goalTitle.trim(),
        category: goalCategory,
        timeframe: goalTimeframe,
        deadline: goalDeadline,
        targetMetric: goalTargetMetric.trim() || undefined,
        progress: 0,
        color: '#0052FF',
        milestones: parsedMilestones.length > 0
          ? parsedMilestones
          : [{ id: `gm-${Date.now()}`, title: 'Initial Milestone', completed: false, progress: 0 }]
      });
      setGoalTitle('');
      setGoalTargetMetric('');
      setGoalMilestonesInput('');
    } else if (activeTab === 'bookmark' && bmTitle.trim() && bmUrl.trim()) {
      addBookmark({
        title: bmTitle.trim(),
        url: bmUrl.trim().startsWith('http') ? bmUrl.trim() : `https://${bmUrl.trim()}`,
        category: bmCategory,
        type: 'link',
        tags: ['#Saved'],
        isFavorite: false,
        isRead: false
      });
      setBmTitle('');
      setBmUrl('');
    }

    closeQuickAdd();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl ios-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-card-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0052FF]" />
            <span>Quick Create</span>
          </h2>
          <button
            onClick={closeQuickAdd}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex items-center gap-1.5 px-6 pt-3 overflow-x-auto pb-2 border-b border-border">
          {[
            { id: 'task', label: 'Task', icon: CheckSquare },
            { id: 'note', label: 'Note', icon: FileText },
            { id: 'habit', label: 'Habit', icon: Zap },
            { id: 'event', label: 'Event', icon: CalendarIcon },
            { id: 'expense', label: 'Finance', icon: DollarSign },
            { id: 'goal', label: 'Goal', icon: Target },
            { id: 'bookmark', label: 'Resource', icon: Bookmark }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* TASK TAB */}
          {activeTab === 'task' && (
            <>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Architect Core Services"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="Additional context or notes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <CustomDatePicker value={taskDueDate} onChange={setTaskDueDate} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Due Time
                  </label>
                  <CustomTimePicker value={taskDueTime} onChange={setTaskDueTime} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <CustomSelect
                    value={taskPriority}
                    onChange={v => setTaskPriority(v as PriorityLevel)}
                    options={[
                      { value: 'P1', label: 'P1 - Urgent', color: '#EF4444' },
                      { value: 'P2', label: 'P2 - High', color: '#F59E0B' },
                      { value: 'P3', label: 'P3 - Medium', color: '#3B82F6' },
                      { value: 'P4', label: 'P4 - Low', color: '#94A3B8' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <CustomSelect
                    value={taskCategory}
                    onChange={setTaskCategory}
                    options={[
                      { value: 'Work', label: 'Work', color: '#0052FF' },
                      { value: 'Personal', label: 'Personal', color: '#10B981' },
                      { value: 'Health', label: 'Health', color: '#EC4899' },
                      { value: 'Finance', label: 'Finance', color: '#F59E0B' },
                      { value: 'Learning', label: 'Learning', color: '#8B5CF6' }
                    ]}
                  />
                </div>
              </div>
            </>
          )}

          {/* NOTE TAB */}
          {activeTab === 'note' && (
            <>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Note Title
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="e.g. High-Velocity Architecture Insights"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Write your note, thoughts, or checklist..."
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF] resize-none"
                />
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Note Color Theme
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/60 border border-border">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNoteColor(c.hex)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        noteColor === c.hex ? 'scale-110 shadow-sm ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {noteColor === c.hex && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* HABIT TAB */}
          {activeTab === 'habit' && (
            <>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  value={habitTitle}
                  onChange={e => setHabitTitle(e.target.value)}
                  placeholder="e.g. 15-Minute Daily Reflection"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <CustomSelect
                  value={habitCategory}
                  onChange={v => setHabitCategory(v as any)}
                  options={[
                    { value: 'Health', label: 'Health' },
                    { value: 'Fitness', label: 'Fitness' },
                    { value: 'Work', label: 'Work' },
                    { value: 'Mindset', label: 'Mindset' },
                    { value: 'Learning', label: 'Learning' }
                  ]}
                />
              </div>
            </>
          )}

          {/* CALENDAR EVENT TAB */}
          {activeTab === 'event' && (
            <>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="e.g. Sprint Architecture Sync"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <CustomDatePicker value={eventDate} onChange={setEventDate} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <CustomTimePicker value={eventStart} onChange={setEventStart} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    End Time
                  </label>
                  <CustomTimePicker value={eventEnd} onChange={setEventEnd} />
                </div>
              </div>
            </>
          )}

          {/* FINANCE TRANSACTION TAB */}
          {activeTab === 'expense' && (
            <>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Description / Merchant
                </label>
                <input
                  type="text"
                  required
                  value={txTitle}
                  onChange={e => setTxTitle(e.target.value)}
                  placeholder="e.g. AWS Cloud Cluster"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    placeholder="49.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Transaction Date
                  </label>
                  <CustomDatePicker value={txDate} onChange={setTxDate} />
                </div>
              </div>
            </>
          )}

          {/* GOAL TAB */}
          {activeTab === 'goal' && (
            <>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Goal Title
                </label>
                <Input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder="e.g. Master System Design & Scale to 10k RPS"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <CustomSelect
                    value={goalCategory}
                    onChange={(val) => setGoalCategory(val as GoalItem['category'])}
                    options={[
                      { value: 'Career', label: 'Career & Tech' },
                      { value: 'Learning', label: 'Learning' },
                      { value: 'Fitness', label: 'Fitness' },
                      { value: 'Finance', label: 'Finance' },
                      { value: 'Personal', label: 'Personal' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Timeframe
                  </label>
                  <CustomSelect
                    value={goalTimeframe}
                    onChange={(val) => setGoalTimeframe(val as GoalItem['timeframe'])}
                    options={[
                      { value: 'yearly', label: 'Yearly Vision' },
                      { value: 'monthly', label: 'Monthly Target' },
                      { value: 'weekly', label: 'Weekly Milestone' }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Target Metric (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. $50k ARR or 10k Users"
                    value={goalTargetMetric}
                    onChange={e => setGoalTargetMetric(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Target Deadline
                  </label>
                  <CustomDatePicker
                    value={goalDeadline}
                    onChange={setGoalDeadline}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Key Milestones (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Design Distributed Cache&#10;Implement Raft Consensus&#10;Load test 100k RPS"
                  value={goalMilestonesInput}
                  onChange={e => setGoalMilestonesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none leading-relaxed transition"
                />
              </div>
            </>
          )}

          {/* BOOKMARK TAB */}
          {activeTab === 'bookmark' && (
            <>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  value={bmTitle}
                  onChange={e => setBmTitle(e.target.value)}
                  placeholder="e.g. Bun Performance Guide"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  URL
                </label>
                <input
                  type="url"
                  required
                  value={bmUrl}
                  onChange={e => setBmUrl(e.target.value)}
                  placeholder="https://bun.sh/docs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
            </>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={closeQuickAdd}
              className="text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-5 py-2 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Item</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}