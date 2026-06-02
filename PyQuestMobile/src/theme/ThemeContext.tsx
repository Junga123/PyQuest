import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { darkColors, lightColors, Palette, ThemeMode } from './theme';
import { loadJSON, saveJSON } from '../api/storage';

interface ThemeState {
  mode: ThemeMode;
  colors: Palette;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

const ThemeCtx = createContext<ThemeState | undefined>(undefined);
const K_THEME = 'theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    loadJSON<ThemeMode>(K_THEME, 'dark').then((m) => setModeState(m === 'light' ? 'light' : 'dark'));
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    saveJSON(K_THEME, m);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      saveJSON(K_THEME, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeState>(
    () => ({ mode, colors: mode === 'dark' ? darkColors : lightColors, toggle, setMode }),
    [mode, toggle, setMode],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Строит мемоизированные стили от активной палитры.
export function useThemedStyles<T>(factory: (c: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
