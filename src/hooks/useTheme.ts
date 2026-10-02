import { useState, useEffect } from 'react';
import { ThemeConfig, ThemeMode, AccentColor } from '../types';
import { loadThemeFromStorage, saveThemeToStorage } from '../utils/storage';

export const ACCENT_PALETTES: Record<AccentColor, {
  name: string;
  primary: string;
  bgLight: string;
  bgDark: string;
  border: string;
  badge: string;
  hex: string;
}> = {
  indigo: {
    name: 'Modern Indigo',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    bgLight: 'bg-indigo-50 text-indigo-700',
    bgDark: 'dark:bg-indigo-950/60 dark:text-indigo-300',
    border: 'border-indigo-500',
    badge: 'text-indigo-600 dark:text-indigo-400',
    hex: '#4F46E5',
  },
  emerald: {
    name: 'Sage Emerald',
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    bgLight: 'bg-emerald-50 text-emerald-700',
    bgDark: 'dark:bg-emerald-950/60 dark:text-emerald-300',
    border: 'border-emerald-500',
    badge: 'text-emerald-600 dark:text-emerald-400',
    hex: '#059669',
  },
  amber: {
    name: 'Sunset Amber',
    primary: 'bg-amber-600 text-white hover:bg-amber-700',
    bgLight: 'bg-amber-50 text-amber-700',
    bgDark: 'dark:bg-amber-950/60 dark:text-amber-300',
    border: 'border-amber-500',
    badge: 'text-amber-600 dark:text-amber-400',
    hex: '#D97706',
  },
  rose: {
    name: 'Coral Rose',
    primary: 'bg-rose-600 text-white hover:bg-rose-700',
    bgLight: 'bg-rose-50 text-rose-700',
    bgDark: 'dark:bg-rose-950/60 dark:text-rose-300',
    border: 'border-rose-500',
    badge: 'text-rose-600 dark:text-rose-400',
    hex: '#E11D48',
  },
  ocean: {
    name: 'Pacific Ocean',
    primary: 'bg-cyan-600 text-white hover:bg-cyan-700',
    bgLight: 'bg-cyan-50 text-cyan-700',
    bgDark: 'dark:bg-cyan-950/60 dark:text-cyan-300',
    border: 'border-cyan-500',
    badge: 'text-cyan-600 dark:text-cyan-400',
    hex: '#0891B2',
  },
  violet: {
    name: 'Royal Violet',
    primary: 'bg-violet-600 text-white hover:bg-violet-700',
    bgLight: 'bg-violet-50 text-violet-700',
    bgDark: 'dark:bg-violet-950/60 dark:text-violet-300',
    border: 'border-violet-500',
    badge: 'text-violet-600 dark:text-violet-400',
    hex: '#7C3AED',
  },
};

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(() => loadThemeFromStorage());

  useEffect(() => {
    saveThemeToStorage(theme);

    const root = document.documentElement;
    if (theme.mode === 'dark' || theme.mode === 'amoled') {
      root.classList.add('dark');
      if (theme.mode === 'amoled') {
        root.classList.add('amoled-mode');
        document.body.style.backgroundColor = '#000000';
      } else {
        root.classList.remove('amoled-mode');
        document.body.style.backgroundColor = '#0B0F17';
      }
    } else {
      root.classList.remove('dark', 'amoled-mode');
      document.body.style.backgroundColor = '#F8FAFC';
    }

    // Set meta theme-color to match accent or background
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.mode === 'light' ? '#FFFFFF' : '#0B0F17');
    }
  }, [theme]);

  const setMode = (mode: ThemeMode) => setTheme((prev) => ({ ...prev, mode }));
  const setAccent = (accent: AccentColor) => setTheme((prev) => ({ ...prev, accent }));

  return {
    theme,
    setMode,
    setAccent,
    currentPalette: ACCENT_PALETTES[theme.accent],
  };
}
