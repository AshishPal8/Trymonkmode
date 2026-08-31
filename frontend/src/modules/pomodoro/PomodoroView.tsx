'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { ambientSound, AmbientSoundType, triggerTimerCompletionAlert } from '@/lib/audio';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  CloudRain,
  Coffee,
  Radio,
  Trees,
  Sparkles,
  Music,
  ExternalLink,
  Link2,
  Check,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModuleContainer } from '@/components/layout/ModuleContainer';

const DEFAULT_TITLE = 'TryMonkMode | The Operating System for Deep Work & Daily Habits';

const SPOTIFY_PRESETS = [
  { name: '🎧 Deep Focus', uri: 'playlist/37i9dQZF1DX8Uebhn9wzrS' },
  { name: '☕ Lo-Fi Beats', uri: 'playlist/37i9dQZF1DXdLEN7aqioXM' },
  { name: '🎹 Piano Focus', uri: 'playlist/37i9dQZF1DX4sWSpwq3LiO' },
  { name: '🧠 Brain Food', uri: 'playlist/37i9dQZF1DWXLeA8Omikj7' },
];

export function PomodoroView() {
  const { logFocusSession } = useApp();

  const [activeTab, setActiveTab] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [durationMins] = useState({ pomodoro: 25, shortBreak: 5, longBreak: 15 });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTag] = useState('Deep Work');

  const [activeAmbient, setActiveAmbient] = useState<AmbientSoundType>('none');
  const [spotifyUri, setSpotifyUri] = useState<string>('playlist/37i9dQZF1DX8Uebhn9wzrS');
  const [customSpotifyUrl, setCustomSpotifyUrl] = useState<string>('');
  const [isEditingSpotify, setIsEditingSpotify] = useState<boolean>(false);

  // Timestamp reference for 100% exact zero-drift background timer
  const endTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchStartTimeRef = useRef<number | null>(null);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format Stopwatch MM:SS.SS
  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  // Update browser tab title directly
  const updateTitle = (seconds: number, running: boolean, currentMode: typeof mode) => {
    if (!running) {
      if (seconds < durationMins[currentMode] * 60 && seconds > 0) {
        document.title = `(⏸️ ${formatTime(seconds)}) Paused • TryMonkMode`;
      } else {
        document.title = DEFAULT_TITLE;
      }
      return;
    }
    const emoji = currentMode === 'pomodoro' ? '🎯' : currentMode === 'shortBreak' ? '☕' : '🌴';
    const label = currentMode === 'pomodoro' ? 'Focus' : currentMode === 'shortBreak' ? 'Short Break' : 'Long Break';
    document.title = `(${formatTime(seconds)}) ${emoji} ${label} • TryMonkMode`;
  };

  // Master Pomodoro Timer (Timestamp-based: immune to browser background throttling)
  useEffect(() => {
    if (isRunning) {
      // Calculate target end timestamp
      endTimeRef.current = Date.now() + timeLeft * 1000;

      const tick = () => {
        if (!endTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));

        setTimeLeft(diff);
        updateTitle(diff, true, mode);

        if (diff <= 0) {
          setIsRunning(false);
          endTimeRef.current = null;
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

          document.title = '🔔 Complete! • TryMonkMode';
          triggerTimerCompletionAlert(mode !== 'pomodoro');

          if (mode === 'pomodoro') {
            logFocusSession({
              durationMinutes: durationMins.pomodoro,
              mode: 'pomodoro',
              tag: currentTag,
              timestamp: new Date().toISOString()
            });
          }
        }
      };

      // Immediate first tick
      tick();
      // 500ms interval guarantees perfectly smooth second ticks even with background throttling
      timerIntervalRef.current = setInterval(tick, 500);

      // Instant re-sync when switching tabs
      const handleVisibility = () => {
        tick();
      };
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } else {
      endTimeRef.current = null;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      updateTitle(timeLeft, false, mode);
    }
  }, [isRunning, mode]);

  // Stopwatch Master Timer (Timestamp-based)
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchStartTimeRef.current = Date.now() - stopwatchTime;

      const tickStopwatch = () => {
        if (!stopwatchStartTimeRef.current) return;
        const elapsed = Date.now() - stopwatchStartTimeRef.current;
        setStopwatchTime(elapsed);

        const totalSecs = Math.floor(elapsed / 1000);
        document.title = `(${formatTime(totalSecs)}) ⏱️ Stopwatch • TryMonkMode`;
      };

      stopwatchIntervalRef.current = setInterval(tickStopwatch, 50);

      const handleVisibility = () => {
        tickStopwatch();
      };
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
      if (activeTab === 'stopwatch') {
        document.title = DEFAULT_TITLE;
      }
    }
  }, [isStopwatchRunning, activeTab]);

  // Restore Title on Unmount
  useEffect(() => {
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(durationMins[newMode] * 60);
    updateTitle(durationMins[newMode] * 60, false, newMode);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durationMins[mode] * 60);
    updateTitle(durationMins[mode] * 60, false, mode);
  };

  const handleToggleRunning = () => {
    if (!isRunning && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    setIsRunning(!isRunning);
  };

  const toggleAmbient = (type: AmbientSoundType) => {
    if (activeAmbient === type) {
      ambientSound.stop();
      setActiveAmbient('none');
    } else {
      ambientSound.play(type);
      setActiveAmbient(type);
    }
  };

  const totalSeconds = durationMins[mode] * 60;
  const progressPercent = Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100);

  return (
    <ModuleContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Focus & Timer
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Neuroscience interval timer with ambient soundscapes
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 ios-card rounded-2xl">
          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'pomodoro'
                ? 'bg-[#0052FF] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'stopwatch'
                ? 'bg-[#0052FF] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {activeTab === 'pomodoro' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timer Card */}
          <div className="lg:col-span-2 p-8 rounded-3xl ios-card flex flex-col items-center justify-center text-center space-y-6">
            {/* Mode Selectors */}
            <div className="flex items-center gap-1.5 p-1 bg-muted rounded-2xl">
              <button
                onClick={() => switchMode('pomodoro')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  mode === 'pomodoro' ? 'bg-[#0052FF] text-white font-semibold shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => switchMode('shortBreak')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  mode === 'shortBreak' ? 'bg-[#22C55E] text-white font-semibold shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Break (5m)
              </button>
              <button
                onClick={() => switchMode('longBreak')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  mode === 'longBreak' ? 'bg-[#8B5CF6] text-white font-semibold shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Long Break (15m)
              </button>
            </div>

            {/* Circular Ring */}
            <div className="relative w-60 h-60 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r="95" className="text-muted stroke-current" strokeWidth="8" fill="transparent" />
                <circle
                  cx="120"
                  cy="120"
                  r="95"
                  className="stroke-current text-[#0052FF] transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 95}
                  strokeDashoffset={2 * Math.PI * 95 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-card-foreground">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                  {isRunning ? 'Flow Active' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={resetTimer}
                className="p-3 rounded-full bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <Button
                onClick={handleToggleRunning}
                className={`px-8 py-3.5 rounded-full text-white text-sm font-bold shadow-md transition transform active:scale-95 cursor-pointer flex items-center gap-2 ${
                  isRunning ? 'bg-[#FF5C39] hover:bg-[#E04B2A]' : 'bg-[#0052FF] hover:bg-[#0043D6]'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
              </Button>

              <button
                onClick={() => setTimeLeft(0)}
                className="p-3 rounded-full bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Ambient Sounds & Spotify Focus Player */}
          <div className="p-6 rounded-3xl ios-card space-y-6 flex flex-col justify-between">
            {/* 1. Ambient Sounds */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-card-foreground flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#0052FF]" />
                  <span>Ambient Audio</span>
                </h3>
                {activeAmbient !== 'none' && (
                  <span className="text-[10px] font-bold text-[#0052FF] bg-[#0052FF]/10 px-2 py-0.5 rounded-full animate-pulse">
                    Playing Sound
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'rain', label: 'Rainfall', icon: CloudRain },
                  { id: 'cafe', label: 'Cafe', icon: Coffee },
                  { id: 'forest', label: 'Forest', icon: Trees },
                  { id: 'cosmic', label: 'Cosmic', icon: Sparkles },
                  { id: 'whitenoise', label: 'White Noise', icon: Radio }
                ].map(snd => {
                  const Icon = snd.icon;
                  const isPlaying = activeAmbient === snd.id;
                  return (
                    <button
                      key={snd.id}
                      onClick={() => toggleAmbient(snd.id as AmbientSoundType)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        isPlaying
                          ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-sm'
                          : 'bg-muted/60 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{snd.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Spotify Focus Station Player */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1DB954]/15 flex items-center justify-center text-[#1DB954]">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-card-foreground">Spotify Focus Player</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingSpotify(!isEditingSpotify)}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition flex items-center gap-1 cursor-pointer"
                    title="Change custom playlist link"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>{isEditingSpotify ? 'Cancel' : 'Custom Link'}</span>
                  </button>

                  <a
                    href={`https://open.spotify.com/${spotifyUri}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#1DB954] hover:underline font-semibold flex items-center gap-1 transition"
                    title="Open in Spotify App"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Custom URL Input Form */}
              {isEditingSpotify ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customSpotifyUrl.trim()) return;
                    const match = customSpotifyUrl.match(/open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
                    if (match) {
                      setSpotifyUri(`${match[1]}/${match[2]}`);
                      setIsEditingSpotify(false);
                      setCustomSpotifyUrl('');
                    } else if (customSpotifyUrl.includes('spotify:')) {
                      const parts = customSpotifyUrl.replace('spotify:', '').split(':');
                      if (parts.length >= 2) {
                        setSpotifyUri(`${parts[0]}/${parts[1]}`);
                        setIsEditingSpotify(false);
                        setCustomSpotifyUrl('');
                      }
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    type="text"
                    placeholder="Paste Spotify Playlist / Track URL..."
                    value={customSpotifyUrl}
                    onChange={(e) => setCustomSpotifyUrl(e.target.value)}
                    className="text-xs font-mono"
                  />
                  <Button
                    type="submit"
                    className="bg-[#1DB954] hover:bg-[#1AA34A] text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>Load</span>
                  </Button>
                </form>
              ) : (
                /* Preset Buttons */
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {SPOTIFY_PRESETS.map((preset) => (
                    <button
                      key={preset.uri}
                      type="button"
                      onClick={() => setSpotifyUri(preset.uri)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                        spotifyUri === preset.uri
                          ? 'bg-[#1DB954] text-white shadow-xs'
                          : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Spotify Embed Widget */}
              <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-border/60 bg-black/40">
                <iframe
                  src={`https://open.spotify.com/embed/${spotifyUri}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="w-full rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Stopwatch View */
        <div className="max-w-xl mx-auto p-8 rounded-3xl ios-card text-center space-y-6">
          <div className="text-5xl font-bold font-mono tracking-tight text-card-foreground py-4">
            {formatStopwatch(stopwatchTime)}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setIsStopwatchRunning(false);
                setStopwatchTime(0);
              }}
              className="px-5 py-2.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold hover:text-foreground cursor-pointer"
            >
              Reset
            </button>
            <Button
              onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
              className={`px-8 py-3 rounded-full text-white text-xs font-bold shadow-md cursor-pointer ${
                isStopwatchRunning ? 'bg-[#FF5C39]' : 'bg-[#0052FF]'
              }`}
            >
              {isStopwatchRunning ? 'Stop' : 'Start'}
            </Button>
          </div>
        </div>
      )}
    </ModuleContainer>
  );
}
