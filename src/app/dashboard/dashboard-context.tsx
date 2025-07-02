
'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { DashboardData } from '@/lib/types';

const DashboardContext = createContext<DashboardData>(null);

export function DashboardDataProvider({ children, data }: { children: ReactNode; data: DashboardData }) {
  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
      // This can be undefined on initial load, components should handle it.
      return null;
  }
  return context;
}
