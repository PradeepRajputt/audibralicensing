
import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeaderStatic } from '@/components/layout/dashboard-header-static';
import { hasUnreadCreatorFeedback } from '@/lib/feedback-store';
import { getUserById } from '@/lib/users-store';
import { unstable_noStore as noStore } from 'next/cache';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();
  // In a real app, this would be from the session. For the prototype, we use a fixed ID.
  const userId = "user_creator_123";
  const [hasUnread, dbUser] = await Promise.all([
    hasUnreadCreatorFeedback(userId),
    getUserById(userId),
  ]);

  // Convert MongoDB document to a plain JSON-serializable object
  const user = dbUser ? JSON.parse(JSON.stringify(dbUser)) : undefined;

  const channelConnected = !!user?.youtubeChannelId;

  return (
    <SidebarProvider>
        <CreatorSidebar 
            hasUnreadFeedback={hasUnread} 
            channelConnected={channelConnected}
            user={user}
        />
        <SidebarInset>
            <DashboardHeaderStatic user={user} />
            <main className="p-4 md:p-6 flex-1 flex flex-col">
              {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
