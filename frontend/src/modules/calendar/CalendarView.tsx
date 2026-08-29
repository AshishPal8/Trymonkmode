'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trash2
} from 'lucide-react';
import { formatDatePretty, getTodayDateString } from '@/lib/utils';
import { CalendarEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ModuleContainer } from '@/components/layout/ModuleContainer';
import { CustomSelect } from '@/components/ui/select';
import { CustomDatePicker } from '@/components/ui/date-picker';
import { CustomTimePicker } from '@/components/ui/time-picker';

export function CalendarView() {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState(getTodayDateString());

  // New Event Form State
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [category, setCategory] = useState<CalendarEvent['category']>('deep-work');
  const [description, setDescription] = useState('');

  // Days in month calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDayDate(dateStr);
    const dayEvents = calendarEvents.filter(e => e.date === dateStr);
    if (dayEvents.length > 0) {
      setShowDayDetailsModal(true);
    } else {
      setEventDate(dateStr);
      setShowAddModal(true);
    }
  };

  const openAddEventForDate = (dateStr?: string) => {
    const targetDate = dateStr || selectedDayDate || getTodayDateString();
    setEventDate(targetDate);
    setTitle('');
    setDescription('');
    setShowDayDetailsModal(false);
    setShowAddModal(true);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const colors: Record<CalendarEvent['category'], string> = {
      'deep-work': '#8B5CF6',
      meeting: '#0052FF',
      fitness: '#EC4899',
      personal: '#22C55E',
      learning: '#F59E0B'
    };

    addCalendarEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      date: eventDate,
      startTime,
      endTime,
      category,
      color: colors[category]
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const selectedDayEvents = calendarEvents.filter(e => e.date === selectedDayDate);

  return (
    <ModuleContainer>
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Smart Calendar
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Orchestrate your hours, meetings, and deep flow blocks in Day, Week, or Month view
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex p-1 ios-card rounded-2xl">
            {(['month', 'week', 'day'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                  viewMode === mode
                    ? 'bg-[#0052FF] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button
            onClick={() => openAddEventForDate(getTodayDateString())}
            className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-sm transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </Button>
        </div>
      </div>

      {/* Month Navigator Bar */}
      <div className="flex items-center justify-between p-4 rounded-3xl ios-card">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold text-card-foreground px-2">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Deep Work</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0052FF]" /> Meeting</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EC4899]" /> Fitness</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Personal</span>
        </div>
      </div>

      {/* MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="p-4 sm:p-6 rounded-3xl ios-card">
          {/* Day Names Row */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground pb-3 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-3">
            {/* Empty slots */}
            {[...Array(firstDayIndex)].map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[48px] sm:min-h-[90px] rounded-xl sm:rounded-2xl bg-muted/20 border border-transparent" />
            ))}

            {/* Days in Month */}
            {[...Array(totalDaysInMonth)].map((_, dayIdx) => {
              const dayNum = dayIdx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === getTodayDateString();
              const isSelected = dateStr === selectedDayDate;
              const dayEvents = calendarEvents.filter(e => e.date === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDayClick(dateStr)}
                  className={`min-h-[48px] sm:min-h-[90px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition flex flex-col justify-between cursor-pointer group ${
                    isToday
                      ? 'border-[#0052FF] bg-[#0052FF]/10 shadow-sm'
                      : isSelected
                      ? 'border-[#0052FF]/60 bg-muted/70'
                      : 'border-border bg-muted/40 hover:border-muted-foreground/40 hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition ${
                        isToday
                          ? 'bg-[#0052FF] text-white'
                          : 'text-card-foreground group-hover:text-[#0052FF]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="hidden sm:inline text-[10px] text-muted-foreground font-bold group-hover:text-foreground">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Indicators (Dots on mobile, pills on desktop) */}
                  <div className="mt-1 overflow-hidden">
                    {/* Mobile Dot Bar */}
                    <div className="flex sm:hidden items-center justify-center gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map(e => (
                        <span
                          key={e.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                      ))}
                    </div>

                    {/* Desktop Text Badges */}
                    <div className="hidden sm:block space-y-1">
                      {dayEvents.slice(0, 2).map(e => (
                        <div
                          key={e.id}
                          onClick={(eAction) => {
                            eAction.stopPropagation();
                            setSelectedDayDate(dateStr);
                            setShowDayDetailsModal(true);
                          }}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg text-white truncate cursor-pointer hover:opacity-90 transition transform hover:scale-[1.02]"
                          style={{ backgroundColor: e.color }}
                          title={`${e.startTime} - ${e.title}`}
                        >
                          {e.startTime} {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] font-bold text-muted-foreground block group-hover:text-[#0052FF]">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY / WEEK SCHEDULE TIMELINE */}
      {(viewMode === 'day' || viewMode === 'week') && (
        <div className="p-4 sm:p-6 rounded-3xl ios-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-card-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0052FF]" />
              <span>Schedule for {formatDatePretty(selectedDayDate)}</span>
            </h3>

            <Button
              onClick={() => openAddEventForDate(selectedDayDate)}
              className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-full px-3 py-1.5 shadow-sm transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to {formatDatePretty(selectedDayDate).split(',')[0]}</span>
            </Button>
          </div>

          <div className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-muted/30 border border-border/50">
                <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-muted-foreground">No events scheduled for this day</p>
                <button
                  onClick={() => openAddEventForDate(selectedDayDate)}
                  className="mt-2 text-xs font-bold text-[#0052FF] hover:underline cursor-pointer"
                >
                  + Add an event
                </button>
              </div>
            ) : (
              selectedDayEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-muted/60 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-10 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-card-foreground">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-2.5 sm:px-3 py-1 rounded-xl bg-card border border-border text-xs font-mono font-bold text-card-foreground">
                      {event.startTime} - {event.endTime}
                    </div>
                    <button
                      onClick={() => deleteCalendarEvent(event.id)}
                      className="p-2 text-muted-foreground hover:text-rose-500 rounded-xl hover:bg-muted transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DAY EVENTS DETAILS & INSPECTOR MODAL */}
      {showDayDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="ios-card rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[85vh] flex flex-col justify-between">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-card-foreground">
                    {formatDatePretty(selectedDayDate)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'event' : 'events'} scheduled
                  </p>
                </div>

                <button
                  onClick={() => setShowDayDetailsModal(false)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Event List */}
              <div className="space-y-2.5 overflow-y-auto max-h-[50vh] pr-1">
                {selectedDayEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 rounded-2xl bg-muted/60 border border-border flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 flex-1 overflow-hidden">
                      <div
                        className="w-1.5 h-8 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-xs font-bold text-card-foreground truncate">
                          {event.title}
                        </h4>
                        <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                          {event.startTime} - {event.endTime}
                        </span>
                        {event.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteCalendarEvent(event.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-muted rounded-lg transition cursor-pointer shrink-0"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <Button
                onClick={() => openAddEventForDate(selectedDayDate)}
                className="w-full bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl py-2.5 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Event on {selectedDayDate}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CALENDAR EVENT MODAL (PREFILLED WITH CLICKED DATE) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="ios-card rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <h3 className="text-base font-bold text-card-foreground">
                Add Event · {formatDatePretty(eventDate)}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deep Focus: System Architecture"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Category</label>
                <CustomSelect
                  value={category}
                  onChange={v => setCategory(v as CalendarEvent['category'])}
                  options={[
                    { value: 'deep-work', label: 'Deep Work', color: '#8B5CF6' },
                    { value: 'meeting', label: 'Team Sync / Meeting', color: '#0052FF' },
                    { value: 'fitness', label: 'Fitness & Health', color: '#EC4899' },
                    { value: 'personal', label: 'Personal Life', color: '#22C55E' },
                    { value: 'learning', label: 'Learning & Books', color: '#F59E0B' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Date</label>
                  <CustomDatePicker
                    value={eventDate}
                    onChange={setEventDate}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Start Time</label>
                  <CustomTimePicker
                    value={startTime}
                    onChange={setStartTime}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">End Time</label>
                  <CustomTimePicker
                    value={endTime}
                    onChange={setEndTime}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Notes, agenda, or location..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  className="px-5 py-2 bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Save Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModuleContainer>
  );
}
