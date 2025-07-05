
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { DashboardData } from '@/lib/types';
import { getDashboardData } from './actions';
import { useYouTube } from '@/context/youtube-context';

const DashboardContext = createContext<DashboardData | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode; }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const { isYouTubeConnected } = useYouTube();
  
  useEffect(() => {
    if (isYouTubeConnected) {
      getDashboardData().then(setData);
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
