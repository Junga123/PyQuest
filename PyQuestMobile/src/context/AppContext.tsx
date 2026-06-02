import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api/mockApi';
import { User } from '../types';

interface AppState {
  ready: boolean;
  user: User | null;
  stats: api.UserStats | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  resetProgress: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<api.UserStats | null>(null);

  const refresh = useCallback(async () => {
    const [u, s] = await Promise.all([api.getSession(), api.getStats()]);
    setUser(u);
    setStats(s);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setReady(true);
      }
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    await refresh();
  }, [refresh]);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await api.register(email, password, displayName);
    setUser(res.user);
    await refresh();
  }, [refresh]);

  const loginDemo = useCallback(async () => {
    const res = await api.loginDemo();
    setUser(res.user);
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setStats(null);
  }, []);

  const resetProgress = useCallback(async () => {
    await api.resetProgress();
    setUser(null);
    setStats(null);
  }, []);

  const value = useMemo<AppState>(
    () => ({ ready, user, stats, login, register, loginDemo, logout, refresh, resetProgress }),
    [ready, user, stats, login, register, loginDemo, logout, refresh, resetProgress],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
