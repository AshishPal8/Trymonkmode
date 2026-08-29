'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';

export type Theme = 'dark' | 'light';

const listeners = new Set<(theme: Theme) => void>();
let globalTheme: Theme = 'dark';

function notify(newTheme: Theme) {
  globalTheme = newTheme;
  listeners.forEach(listener => listener(newTheme));
}

function applyThemeToDOM(newTheme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (newTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }
  root.setAttribute('data-theme', newTheme);
  try {
    localStorage.setItem('trymonk_theme', newTheme);
  } catch (e) {}
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = (localStorage.getItem('trymonk_theme') || localStorage.getItem('aura_theme')) as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        globalTheme = saved;
        return saved;
      }
      if (document.documentElement.classList.contains('dark')) {
        globalTheme = 'dark';
        return 'dark';
      }
    }
    return globalTheme;
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem('trymonk_theme') || localStorage.getItem('aura_theme')) as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      globalTheme = saved;
      setThemeState(saved);
      applyThemeToDOM(saved);
    } else {
      const isDark = document.documentElement.classList.contains('dark');
      const initial: Theme = isDark ? 'dark' : 'light';
      globalTheme = initial;
      setThemeState(initial);
      applyThemeToDOM(initial);
    }

    const handleThemeChange = (newTheme: Theme) => {
      setThemeState(newTheme);
    };

    listeners.add(handleThemeChange);
    return () => {
      listeners.delete(handleThemeChange);
    };
  }, []);

  const setTheme = useCallback((newTheme: Theme, syncBackend = true) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    notify(newTheme);
    useUserStore.getState().setTheme(newTheme, syncBackend);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    mounted
  };
}
