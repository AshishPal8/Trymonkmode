'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/store';
import { ambientSound, AmbientSoundType } from '@/lib/audio';
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
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModuleContainer } from '@/components/layout/ModuleContainer';

export function PomodoroView() {
  const { logFocusSession } = useApp();

  const [activeTab, setActiveTab] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [durationMins] = useState({ pomodoro: 25, shortBreak: 5, longBreak: 15 });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTag] = useState('Deep Work');

  const [activeAmbient, setActiveAmbient] = useState<AmbientSoundType>('none');

  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'pomodoro') {
        logFocusSession({
          durationMinutes: durationMins.pomodoro,
          mode: 'pomodoro',
          tag: currentTag,
          timestamp: new Date().toISOString()
        });
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, durationMins, currentTag, logFocusSession]);

  const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(durationMins[newMode] * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durationMins[mode] * 60);
  };

  useEffect(() => {
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchTime;
      stopwatchIntervalRef.current = setInterval(() => setStopwatchTime(Date.now() - startTime), 10);
    } else if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning, stopwatchTime]);

  const toggleAmbient = (type: AmbientSoundType) => {
    if (activeAmbient === type) {
      ambientSound.stop();
      setActiveAmbient('none');
    } else {
      ambientSound.play(type);
      setActiveAmbient(type);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
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
                onClick={() => setIsRunning(!isRunning)}
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

          {/* Right Column: Ambient Sounds */}
          <div className="p-6 rounded-3xl ios-card space-y-4">
            <h3 className="text-sm font-bold text-card-foreground flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#0052FF]" />
              <span>Ambient Audio</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
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
                        : 'bg-muted/60 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{snd.label}</span>
                  </button>
                );
              })}
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
