
import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getUserById } from '@/lib/users-store';
import { DashboardLayoutClient } from './layout-client';

// This is now an async Server Component
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, this would be from the session
  const user = await getUserById("user_creator_123");
  const channelConnected = !!user?.youtubeChannelId;

  return (
    <SidebarProvider>
      <DashboardLayoutClient user={user} channelConnected={channelConnected}>
          {children}
      </DashboardLayoutClient>
    </SidebarProvider>
  );
}
