'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  Plus,
  Inbox,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  ListTodo,
  Search,
  X
} from 'lucide-react';
import { formatDatePretty, getTodayDateString } from '@/lib/utils';
import { PriorityLevel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ModuleContainer } from '@/components/layout/ModuleContainer';
import { CustomSelect } from '@/components/ui/select';
import { CustomDatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';

export function TasksView() {
  const { tasks, addTask, toggleTask, deleteTask } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'inbox' | 'completed'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('P1');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('12:00');
  const [tags, setTags] = useState('#Work');

  const todayStr = getTodayDateString();

  const filteredTasks = tasks.filter(t => {
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (activeTab === 'today') return t.dueDate === todayStr || (!t.completed && t.dueDate < todayStr);
    if (activeTab === 'upcoming') return t.dueDate > todayStr;
    if (activeTab === 'inbox') return !t.completed;
    if (activeTab === 'completed') return t.completed;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: desc.trim() || undefined,
      priority,
      dueDate,
      dueTime,
      category: 'Work',
      tags: tags.split(' ').filter(Boolean),
      subtasks: [],
      completed: false,
      quadrant: priority === 'P1' ? 'urgent-important' : 'notUrgent-important'
    });

    setTitle('');
    setDesc('');
    setShowAddModal(false);
  };

  const priorityColors: Record<PriorityLevel, string> = {
    P1: 'bg-[#FF5C39] text-[#FF5C39]',
    P2: 'bg-[#F59E0B] text-[#F59E0B]',
    P3: 'bg-[#0052FF] text-[#0052FF]',
    P4: 'bg-zinc-400 text-zinc-400'
  };

  return (
    <ModuleContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Tasks
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Clean, focused execution list with priority tags and schedule dates
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl px-4 py-2 shadow-sm transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Clean Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex p-1 ios-card rounded-2xl bg-card border border-border overflow-x-auto">
          {[
            { id: 'today', label: 'Today', count: tasks.filter(t => t.dueDate === todayStr).length, icon: Calendar },
            { id: 'upcoming', label: 'Upcoming', count: tasks.filter(t => t.dueDate > todayStr).length, icon: Clock },
            { id: 'inbox', label: 'Inbox', count: tasks.filter(t => !t.completed).length, icon: Inbox },
            { id: 'completed', label: 'Done', count: tasks.filter(t => t.completed).length, icon: CheckCircle2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Priority & Search */}
        <div className="flex items-center gap-2">
          <div className="w-36">
            <CustomSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'P1', label: 'P1 Urgent' },
                { value: 'P2', label: 'P2 High' },
                { value: 'P3', label: 'P3 Medium' },
                { value: 'P4', label: 'P4 Low' }
              ]}
            />
          </div>

          <Input
            leftIcon={<Search className="w-3.5 h-3.5" />}
            placeholder="Filter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            containerClassName="w-28 sm:w-36"
          />
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl ios-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto shadow-sm">
              <ListTodo className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">No tasks in this list</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Your task queue is clear. Create your first task to start organizing your day.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-sm cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Task</span>
            </Button>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl ios-card transition flex items-center justify-between gap-3 ${
                task.completed ? 'opacity-50' : ''
              }`}
            >
              {/* Checkbox + Title */}
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
                    task.completed
                      ? 'bg-[#22C55E] text-white'
                      : 'border-2 border-muted-foreground hover:border-[#0052FF]'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                    <span
                      className={`text-xs sm:text-sm font-medium truncate ${
                        task.completed
                          ? 'line-through text-muted-foreground'
                          : 'text-card-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-muted-foreground truncate ml-4 mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Due Date + Delete Action */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {formatDatePretty(task.dueDate)}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="ios-card rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-card-foreground">Create New Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Microservice Architecture"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Key sub-deliverables or context..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Priority</label>
                  <CustomSelect
                    value={priority}
                    onChange={(val) => setPriority(val as PriorityLevel)}
                    options={[
                      { value: 'P1', label: 'P1 Urgent' },
                      { value: 'P2', label: 'P2 High' },
                      { value: 'P3', label: 'P3 Medium' },
                      { value: 'P4', label: 'P4 Low' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Due Date</label>
                  <CustomDatePicker
                    value={dueDate}
                    onChange={setDueDate}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="#Work #SystemDesign"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-5 py-2 shadow-sm cursor-pointer"
                >
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModuleContainer>
  );
}