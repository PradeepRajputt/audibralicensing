
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { DashboardData } from '@/lib/types';
import { getDashboardData } from './actions';
import { useYouTube } from '@/context/youtube-context';
import jwt from 'jsonwebtoken';

const DashboardContext = createContext<{
  data: DashboardData | null;
  refresh: () => Promise<void>;
} | null>(null);

function getEmailFromJWT() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('creator_jwt');
  if (!token) return null;
  try {
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded === 'object' && 'email' in decoded) {
      return (decoded as { email?: string }).email || null;
    }
    return null;
  } catch {
    return null;
  }
}

export function DashboardDataProvider({ children }: { children: ReactNode; }) {
  const [data, setData] = useState<DashboardData | null>(null);

  const refresh = async () => {
    const email = getEmailFromJWT();
    const freshData = await getDashboardData(email ?? undefined);
    setData(freshData);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <DashboardContext.Provider value={{ data, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  // It's okay for the context to be null initially or if not connected
  return context?.data;
}

export function useDashboardRefresh() {
  const context = useContext(DashboardContext);
  return context?.refresh;
}
