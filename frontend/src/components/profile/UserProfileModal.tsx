'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { ActiveModuleId } from '@/lib/types';
import {
  X,
  User,
  Sparkles,
  Sun,
  Moon,
  Bell,
  Volume2,
  Globe,
  Star,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerCelebrationConfetti } from '@/lib/utils';
import { UserAvatar } from '../ui/UserAvatar';

export function UserProfileModal() {
  const {
    pages,
    isProfileModalOpen,
    closeProfileModal,
    user,
    theme,
    setTheme,
    updateUserProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'favorites'>('profile');
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [timezone, setTimezone] = useState(user.timezone || 'UTC');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled ?? true);
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications ?? true);
  const [soundEffects, setSoundEffects] = useState(user.soundEffects ?? true);
  const [selectedFavorites, setSelectedFavorites] = useState<ActiveModuleId[]>(user.favorites || []);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setName(user.name);
    setTitle(user.title);
    setBio(user.bio || '');
    setAvatar(user.avatar);
    setTimezone(user.timezone || 'UTC');
    setNotificationsEnabled(user.notificationsEnabled ?? true);
    setEmailNotifications(user.emailNotifications ?? true);
    setSoundEffects(user.soundEffects ?? true);
    setSelectedFavorites(user.favorites || []);
  }, [user]);

  if (!isProfileModalOpen) return null;

  const handleToggleFavModule = (id: ActiveModuleId) => {
    setSelectedFavorites(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateUserProfile({
        name: name.trim(),
        title: title.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
        timezone,
        theme,
        notificationsEnabled,
        emailNotifications,
        soundEffects,
        favorites: selectedFavorites,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      triggerCelebrationConfetti();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl ios-card shadow-2xl flex flex-col border border-white/20 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">User Profile & Preferences</h2>
              <p className="text-[11px] text-muted-foreground">Manage personal details, theme, and shortcuts</p>
            </div>
          </div>

          <button
            onClick={closeProfileModal}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-border bg-muted/30">
          {[
            { id: 'profile', label: 'Profile Details', icon: User },
            { id: 'preferences', label: 'Preferences & Theme', icon: Sparkles },
            { id: 'favorites', label: 'Sidebar Favorites', icon: Star },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#0052FF] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* User Identity Banner */}
              <div className="p-4 rounded-2xl bg-muted/60 border border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <UserAvatar
                    name={name || user.name || 'Member'}
                    avatarUrl={avatar}
                    size="lg"
                    className="border-2 border-[#0052FF] shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{name}</h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-[#0052FF] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{user.role === 'superadmin' ? 'Superadmin' : 'User'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground font-mono">
                      <span className="flex items-center gap-1 text-[#0052FF] font-bold">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{user.streak}d streak</span>
                      </span>
                      <span>•</span>
                      <span>Level {user.level} ({user.xp} XP)</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                    {user.planTier === 'lifetime' ? 'Lifetime Access' : user.planTier}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Fullstack Architect"
                    className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Bio / Headline</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell TryMonkMode about your goals..."
                  className="w-full px-3.5 py-2 rounded-xl bg-muted border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PREFERENCES & THEME */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              {/* Theme Selector */}
              <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Theme Mode</h4>
                    <p className="text-[11px] text-muted-foreground">Select your interface visual appearance</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#0052FF]/10 text-[#0052FF]">
                    {theme}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setTheme('light', true)}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-[#0052FF] text-white border-transparent shadow-md'
                        : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark', true)}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[#0052FF] text-white border-transparent shadow-md'
                        : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark (OLED)</span>
                  </button>
                </div>
              </div>

              {/* Toggles Strip */}
              <div className="space-y-2">
                {/* Notifications */}
                <div className="p-3 rounded-2xl bg-muted/60 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-[#0052FF]">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Push Notifications</h4>
                      <p className="text-[10px] text-muted-foreground">Receive focus timer and streak reminders</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={e => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#0052FF] cursor-pointer"
                  />
                </div>

                {/* Email Digest */}
                <div className="p-3 rounded-2xl bg-muted/60 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Weekly Digest & Analytics</h4>
                      <p className="text-[10px] text-muted-foreground">Receive weekly velocity reports via email</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={e => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 accent-[#0052FF] cursor-pointer"
                  />
                </div>

                {/* Sound Effects */}
                <div className="p-3 rounded-2xl bg-muted/60 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-[#0052FF]">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Audio & Sound FX</h4>
                      <p className="text-[10px] text-muted-foreground">Play ambient bells on task and quest completion</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEffects}
                    onChange={e => setSoundEffects(e.target.checked)}
                    className="w-4 h-4 accent-[#0052FF] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIDEBAR FAVORITES (Using Unified Blue Theme) */}
          {activeTab === 'favorites' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#0052FF]/10 border border-[#0052FF]/20 text-[#0052FF] text-xs flex items-center gap-2">
                <Star className="w-4 h-4 text-[#0052FF] shrink-0" />
                <span>Pinned favorite modules appear at the top of your sidebar for quick access.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pages.map(m => {
                  const isChecked = selectedFavorites.includes(m.key);
                  return (
                    <div
                      key={m.key}
                      onClick={() => handleToggleFavModule(m.key)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                        isChecked
                          ? 'bg-[#0052FF]/10 border-[#0052FF]/30 text-card-foreground font-semibold'
                          : 'bg-muted/60 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Star className={`w-3.5 h-3.5 ${isChecked ? 'text-[#0052FF] fill-[#0052FF]' : 'text-muted-foreground'}`} />
                        <span className="text-xs">{m.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#0052FF] cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Save & Actions (Cleaned - No Database Mentions) */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Preferences saved successfully!</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeProfileModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                Close
              </button>

              <Button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0052FF] hover:bg-[#0043D6] text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}