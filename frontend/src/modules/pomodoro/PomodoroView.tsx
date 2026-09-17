"use client";

import React, { useState, useEffect } from "react";
import { useFocusStore } from "@/stores/focusStore";
import { ambientSound, AmbientSoundType } from "@/lib/audio";
import { FocusAnalyticsCard } from "./components/FocusAnalyticsCard";
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
  Sliders,
  Timer,
  BarChart3,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { toast } from "@/components/ui/toast";

const SPOTIFY_PRESETS = [
  { name: "🎧 Deep Focus", uri: "playlist/37i9dQZF1DX8Uebhn9wzrS" },
  { name: "☕ Lo-Fi Beats", uri: "playlist/37i9dQZF1DXdLEN7aqioXM" },
  { name: "🎹 Piano Focus", uri: "playlist/37i9dQZF1DX4sWSpwq3LiO" },
  { name: "🧠 Brain Food", uri: "playlist/37i9dQZF1DWXLeA8Omikj7" },
];

const FOCUS_PRESETS = [15, 25, 30, 35, 45, 50, 60, 90];

export function PomodoroView() {
  const {
    activeTab,
    setActiveTab,
    mode,
    setMode,
    durationMins,
    setSprintDuration,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    completeTimerSession,
    getRemainingSeconds,
    isStopwatchRunning,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    getStopwatchElapsedMs,
    activeAmbient,
    setActiveAmbient,
    spotifyUri,
    setSpotifyUri,
    customSpotifyUrl,
    setCustomSpotifyUrl,
    getTodayFocusMinutes,
    getFocusStreak,
  } = useFocusStore();

  // Flip card view: false = Timer, true = 7-Day Stats
  const [isFlipped, setIsFlipped] = useState(false);
  const [customSprintInput, setCustomSprintInput] = useState("");
  const [isCustomDurationOpen, setIsCustomDurationOpen] = useState(false);
  const [isEditingSpotify, setIsEditingSpotify] = useState(false);

  // Local render tick for smooth display
  const [currentSeconds, setCurrentSeconds] = useState(getRemainingSeconds());
  const [stopwatchMs, setStopwatchMs] = useState(getStopwatchElapsedMs());

  const todayMinutes = getTodayFocusMinutes();
  const streak = getFocusStreak();

  // Sync remaining seconds on tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSeconds(getRemainingSeconds());
      if (activeTab === "stopwatch") {
        setStopwatchMs(getStopwatchElapsedMs());
      }
    }, 250);

    return () => clearInterval(interval);
  }, [activeTab, getRemainingSeconds, getStopwatchElapsedMs]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Format Stopwatch MM:SS.SS
  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
  };

  const handleApplyCustomDuration = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customSprintInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 360) {
      setSprintDuration(parsed);
      setIsCustomDurationOpen(false);
      setCustomSprintInput("");
      toast.success(`Focus sprint set to ${parsed} minutes!`);
    } else {
      toast.error("Please enter a duration between 1 and 360 minutes");
    }
  };

  const toggleAmbient = (type: AmbientSoundType) => {
    if (activeAmbient === type) {
      ambientSound.stop();
      setActiveAmbient("none");
    } else {
      ambientSound.play(type);
      setActiveAmbient(type);
    }
  };

  const totalSeconds = durationMins[mode] * 60;
  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(((totalSeconds - currentSeconds) / totalSeconds) * 100),
    ),
  );

  return (
    <ModuleContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Focus & Timer
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/20 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#0052FF]" />
              Today: {todayMinutes}m
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Customizable deep work intervals, background execution, and 7-day
            velocity analytics
          </p>
        </div>

        {/* Right Header: Tab Switcher & Quick Stats Toggle */}
        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex p-1 ios-card rounded-2xl">
            <button
              onClick={() => setActiveTab("pomodoro")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "pomodoro"
                  ? "bg-[#0052FF] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => setActiveTab("stopwatch")}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "stopwatch"
                  ? "bg-[#0052FF] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Stopwatch
            </button>
          </div>
        </div>
      </div>

      {activeTab === "pomodoro" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Flippable Timer Card */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl ios-card min-h-[480px] flex flex-col justify-between transition-all duration-500">
            {isFlipped ? (
              /* Back Side: 7-Day Deep Work Analytics */
              <FocusAnalyticsCard
                onFlipBack={() => setIsFlipped(false)}
                onStartSprint={() => {
                  setIsFlipped(false);
                  startTimer();
                }}
              />
            ) : (
              /* Front Side: Interactive Pomodoro Timer */
              <div className="flex flex-col items-center justify-between h-full space-y-6 text-center">
                {/* Mode Selectors & Flip Button Header */}
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 p-1 bg-muted rounded-2xl">
                    <button
                      onClick={() => setMode("pomodoro")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        mode === "pomodoro"
                          ? "bg-[#0052FF] text-white font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Focus ({durationMins.pomodoro}m)
                    </button>
                    <button
                      onClick={() => setMode("shortBreak")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        mode === "shortBreak"
                          ? "bg-[#22C55E] text-white font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Break (5m)
                    </button>
                    <button
                      onClick={() => setMode("longBreak")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        mode === "longBreak"
                          ? "bg-[#8B5CF6] text-white font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Long Break (15m)
                    </button>
                  </div>

                  {/* Flip Card Button */}
                  <Button
                    onClick={() => setIsFlipped(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-border hover:bg-muted font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    title="View 7-Day Focus Graph and Analytics"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#0052FF]" />
                    <span className="hidden sm:inline">7-Day Stats</span>
                  </Button>
                </div>

                {/* Focus Sprint Duration Pills */}
                {mode === "pomodoro" && (
                  <div className="w-full max-w-md space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <Timer className="w-3.5 h-3.5 text-[#0052FF]" />
                        <span>Sprint Duration</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setIsCustomDurationOpen(!isCustomDurationOpen)
                        }
                        className="text-[11px] text-[#0052FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>{isCustomDurationOpen ? "Close" : "Custom"}</span>
                      </button>
                    </div>

                    {isCustomDurationOpen ? (
                      <form
                        onSubmit={handleApplyCustomDuration}
                        className="flex items-center gap-2"
                      >
                        <Input
                          type="number"
                          min={1}
                          max={360}
                          placeholder="Minutes (e.g. 35, 45, 90)..."
                          value={customSprintInput}
                          onChange={(e) => setCustomSprintInput(e.target.value)}
                          className="text-xs font-mono"
                        />
                        <Button
                          type="submit"
                          className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold px-4 py-2 rounded-xl shrink-0"
                        >
                          Set
                        </Button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {FOCUS_PRESETS.map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setSprintDuration(mins)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition cursor-pointer ${
                              durationMins.pomodoro === mins
                                ? "bg-[#0052FF] text-white font-semibold shadow-xs"
                                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Circular Ring */}
                <div className="relative w-56 h-56 sm:w-60 sm:h-60 flex items-center justify-center my-2">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 240 240"
                  >
                    <circle
                      cx="120"
                      cy="120"
                      r="95"
                      className="text-muted stroke-current"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="120"
                      cy="120"
                      r="95"
                      className="stroke-current text-[#0052FF] transition-all duration-300"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 95}
                      strokeDashoffset={
                        2 * Math.PI * 95 * (1 - progressPercent / 100)
                      }
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-card-foreground">
                      {formatTime(currentSeconds)}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-wider flex items-center gap-1">
                      {isRunning ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-ping" />
                          <span>Deep Work Active</span>
                        </>
                      ) : (
                        "Ready to Focus"
                      )}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => resetTimer(true)}
                    className="p-3 rounded-full bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-xs active:scale-95"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <Button
                    onClick={() => (isRunning ? pauseTimer() : startTimer())}
                    className={`px-8 py-3.5 rounded-full text-white text-sm font-bold shadow-md transition transform active:scale-95 cursor-pointer flex items-center gap-2 ${
                      isRunning
                        ? "bg-[#FF5C39] hover:bg-[#E04B2A]"
                        : "bg-[#0052FF] hover:bg-[#0043D6]"
                    }`}
                  >
                    {isRunning ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white" />
                    )}
                    <span>{isRunning ? "Pause" : "Start Focus"}</span>
                  </Button>

                  <button
                    onClick={() => completeTimerSession()}
                    className="p-3 rounded-full bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shadow-xs active:scale-95"
                    title="Complete & Save Session"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
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
                {activeAmbient !== "none" && (
                  <span className="text-[10px] font-bold text-[#0052FF] bg-[#0052FF]/10 px-2 py-0.5 rounded-full animate-pulse">
                    Playing Sound
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "rain", label: "Rainfall", icon: CloudRain },
                  { id: "cafe", label: "Cafe", icon: Coffee },
                  { id: "forest", label: "Forest", icon: Trees },
                  { id: "cosmic", label: "Cosmic", icon: Sparkles },
                  { id: "whitenoise", label: "White Noise", icon: Radio },
                ].map((snd) => {
                  const Icon = snd.icon;
                  const isPlaying = activeAmbient === snd.id;
                  return (
                    <button
                      key={snd.id}
                      onClick={() => toggleAmbient(snd.id as AmbientSoundType)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        isPlaying
                          ? "bg-[#0052FF] text-white border-[#0052FF] shadow-sm"
                          : "bg-muted/60 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
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
                    <h3 className="text-sm font-bold text-card-foreground">
                      Spotify Focus Player
                    </h3>
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
                    <span>{isEditingSpotify ? "Cancel" : "Custom Link"}</span>
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
                    const match = customSpotifyUrl.match(
                      /open\.spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/,
                    );
                    if (match) {
                      setSpotifyUri(`${match[1]}/${match[2]}`);
                      setIsEditingSpotify(false);
                      setCustomSpotifyUrl("");
                    } else if (customSpotifyUrl.includes("spotify:")) {
                      const parts = customSpotifyUrl
                        .replace("spotify:", "")
                        .split(":");
                      if (parts.length >= 2) {
                        setSpotifyUri(`${parts[0]}/${parts[1]}`);
                        setIsEditingSpotify(false);
                        setCustomSpotifyUrl("");
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
                          ? "bg-[#1DB954] text-white shadow-xs"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
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
            {formatStopwatch(stopwatchMs)}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetStopwatch}
              className="px-5 py-2.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold hover:text-foreground cursor-pointer transition active:scale-95"
            >
              Reset
            </button>
            <Button
              onClick={() =>
                isStopwatchRunning ? pauseStopwatch() : startStopwatch()
              }
              className={`px-8 py-3 rounded-full text-white text-xs font-bold shadow-md cursor-pointer transition active:scale-95 ${
                isStopwatchRunning
                  ? "bg-[#FF5C39] hover:bg-[#E04B2A]"
                  : "bg-[#0052FF] hover:bg-[#0043D6]"
              }`}
            >
              {isStopwatchRunning ? "Pause" : "Start"}
            </Button>
          </div>
        </div>
      )}
    </ModuleContainer>
  );
}
