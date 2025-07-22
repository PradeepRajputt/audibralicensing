
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { DashboardDataProvider } from './dashboard-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Remove all subscription checking logic
  return (
    <SidebarProvider>
      <DashboardDataProvider>
        <CreatorSidebar />
        <SidebarInset>
            <DashboardHeader title="Creator Dashboard" />
            <main className="p-4 md:p-6 flex-1 flex flex-col">
                {children}
            </main>
        </SidebarInset>
      </DashboardDataProvider>
    </SidebarProvider>
  );
}
