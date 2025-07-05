
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function DashboardHeader({ title }: { title: string }) {
  
  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">{title}</h1>
     </header>
  );
}
