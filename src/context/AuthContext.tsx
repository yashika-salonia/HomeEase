import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, TOKEN_STORAGE_KEY } from '../services/api';
import type { User, Worker } from '../types';

interface AuthContextValue {
  user: User | null;
  workerProfile: Worker | null;
  hasWorkerProfile: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User; hasWorkerProfile: boolean }>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    location: string;
    role: 'customer' | 'worker';
  }) => Promise<{ user: User; hasWorkerProfile: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setWorkerProfileState: (profile: Worker | null) => void;
  setUserState: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<Worker | null>(null);
  const [hasWorkerProfile, setHasWorkerProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setUser(null);
      setWorkerProfile(null);
      setHasWorkerProfile(false);
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setHasWorkerProfile(data.hasWorkerProfile);
      setWorkerProfile(data.workerProfile || null);
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      setWorkerProfile(null);
      setHasWorkerProfile(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setUser(data.user);
    setHasWorkerProfile(data.hasWorkerProfile);
    setWorkerProfile(data.workerProfile || null);
    return { user: data.user, hasWorkerProfile: data.hasWorkerProfile };
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      phone: string;
      password: string;
      location: string;
      role: 'customer' | 'worker';
    }) => {
      const data = await authApi.register(payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setUser(data.user);
      setHasWorkerProfile(data.hasWorkerProfile);
      setWorkerProfile(null);
      return { user: data.user, hasWorkerProfile: data.hasWorkerProfile };
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setWorkerProfile(null);
    setHasWorkerProfile(false);
  }, []);

  const setWorkerProfileState = useCallback((profile: Worker | null) => {
    setWorkerProfile(profile);
    setHasWorkerProfile(Boolean(profile));
  }, []);

  const setUserState = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        workerProfile,
        hasWorkerProfile,
        loading,
        login,
        register,
        logout,
        refreshUser,
        setWorkerProfileState,
        setUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
