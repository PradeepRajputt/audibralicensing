
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { DashboardData } from '@/lib/types';
import { getDashboardData } from './actions';
import { useYouTube } from '@/context/youtube-context';
import jwt from 'jsonwebtoken';

const DashboardContext = createContext<DashboardData | null>(null);

function getEmailFromJWT() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('creator_jwt');
  if (!token) return null;
  try {
    const decoded = jwt.decode(token);
    return decoded?.email || null;
  } catch {
    return null;
  }
}

export function DashboardDataProvider({ children }: { children: ReactNode; }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const { isYouTubeConnected } = useYouTube();
  
  useEffect(() => {
    if (isYouTubeConnected) {
      const email = getEmailFromJWT();
      getDashboardData(email ?? undefined).then(setData);
    } else {
      setData(null);
    }
  }, [isYouTubeConnected]);

  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  // It's okay for the context to be null initially or if not connected
  return context;
}
