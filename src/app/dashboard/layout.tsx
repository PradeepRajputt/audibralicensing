
import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { hasUnreadCreatorFeedback } from '@/lib/feedback-store';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    // This should be caught by middleware, but as a fallback.
    redirect('/login');
  }
  
  const userId = session.user.id;
  
  const hasUnread = await hasUnreadCreatorFeedback(userId);
  const channelConnected = !!session.user.youtubeChannelId;

  // --- Redirect Logic ---
  const headersList = headers();
  const nextUrl = headersList.get('next-url') || '';
  // Use a dummy base URL as we only need the pathname
  const pathname = new URL(nextUrl, 'http://localhost').pathname;

  const allowedPathsWithoutConnection = [
      '/dashboard/connect-platform',
      '/dashboard/settings',
      '/dashboard/feedback',
  ];

  if (!channelConnected && !allowedPathsWithoutConnection.some(p => pathname.startsWith(p))) {
      redirect('/dashboard/connect-platform');
  }
  // --- End Redirect Logic ---

  return (
    <SidebarProvider>
        <CreatorSidebar 
            hasUnreadFeedback={hasUnread} 
            channelConnected={channelConnected}
        />
        <SidebarInset>
            <DashboardHeader />
            <main className="p-4 md:p-6 flex-1 flex flex-col">
              {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
