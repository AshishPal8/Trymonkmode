'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className={`w-9 h-9 ${className}`} />;
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle theme"
      className={`relative p-2 rounded-2xl transition-all duration-200 border cursor-pointer ${
        theme === 'dark'
          ? 'bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800'
          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 shadow-sm'
      } ${className}`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
