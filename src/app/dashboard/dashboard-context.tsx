
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { DashboardData } from '@/lib/types';
import { getDashboardData } from './actions';
import { useAuth } from '@/context/auth-context';

const DashboardContext = createContext<DashboardData | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: ReactNode; }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      getDashboardData(user.uid).then(setData);
    }
  }, [user]);

  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
      throw new Error("useDashboardData must be used within a DashboardDataProvider");
  }
  return context;
}
