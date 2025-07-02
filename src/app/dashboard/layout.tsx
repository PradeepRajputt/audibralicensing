
import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardLayoutClient } from './layout-client';
import { DashboardDataProvider } from './dashboard-context';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock data since authentication and real data fetching are removed.
  const mockUser = { uid: 'user_creator_123', displayName: 'Sample Creator', avatar: 'https://placehold.co/128x128.png' };
  const mockDashboardData = {
    analytics: {
      subscribers: 124567,
      views: 9876543,
      mostViewedVideo: { title: 'My Most Epic Adventure Yet!', views: 1200345 },
      dailyData: [],
    },
    activity: [],
    creatorName: 'Sample Creator',
    creatorImage: 'https://placehold.co/128x128.png'
  };

  return (
    <SidebarProvider>
        <DashboardDataProvider data={mockDashboardData}>
            <DashboardLayoutClient 
                user={mockUser as any} 
                channelConnected={true} // Assume connected for UI purposes
                hasUnreadFeedback={true} // Assume there is feedback
            >
                {children}
            </DashboardLayoutClient>
        </DashboardDataProvider>
    </SidebarProvider>
  );
}
