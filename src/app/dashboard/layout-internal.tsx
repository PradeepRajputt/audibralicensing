
'use client';

import * as React from 'react';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import type { User } from '@/lib/types';

export function DashboardLayoutClient({
  user,
  hasUnreadFeedback,
  channelConnected,
  children,
}: {
  user: User | undefined;
  hasUnreadFeedback: boolean;
  channelConnected: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <CreatorSidebar user={user} hasUnreadFeedback={hasUnreadFeedback} channelConnected={channelConnected} />
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 md:p-6 flex-1 flex flex-col">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
