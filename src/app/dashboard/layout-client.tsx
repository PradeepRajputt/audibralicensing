
'use client';

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardLayoutClient as DashboardLayoutInternal } from './layout-internal';
import { useAuth } from '@/components/providers/auth-provider';

export function DashboardLayoutClient({
  hasUnreadFeedback,
  children,
}: {
  hasUnreadFeedback: boolean;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  
  if (loading) {
    // You can return a global loader here if you prefer
    return null;
  }
  
  const channelConnected = !!user?.youtubeChannelId;

  return (
    <SidebarProvider>
        <DashboardLayoutInternal
          user={user ?? undefined}
          channelConnected={channelConnected}
          hasUnreadFeedback={hasUnreadFeedback}
        >
          {children}
        </DashboardLayoutInternal>
    </SidebarProvider>
  );
}
