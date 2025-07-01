
'use client';

import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import type { User } from '@/lib/types';

export function DashboardLayoutClient({
  user,
  children,
}: {
  user: User | undefined;
  children: React.ReactNode;
}) {
  return (
    <>
      <CreatorSidebar user={user} />
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
