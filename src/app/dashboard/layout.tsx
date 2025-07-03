
import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardLayoutClient } from './layout-client';
import { DashboardDataProvider } from './dashboard-context';
import { getDashboardData } from './actions';
import { hasUnreadCreatorFeedback } from '@/lib/feedback-store';


export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you would get this from the session
  const userId = "user_creator_123";

  // Fetch all necessary data in the server layout
  const dashboardData = await getDashboardData();
  const hasUnread = await hasUnreadCreatorFeedback(userId);

  const channelConnected = !!dashboardData?.analytics;

  return (
    <SidebarProvider>
      <DashboardDataProvider data={dashboardData}>
        <DashboardLayoutClient
          user={dashboardData?.user}
          channelConnected={channelConnected}
          hasUnreadFeedback={hasUnread}
        >
          {children}
        </DashboardLayoutClient>
      </DashboardDataProvider>
    </SidebarProvider>
  );
}
