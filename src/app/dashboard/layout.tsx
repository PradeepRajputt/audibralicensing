
import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeaderStatic } from '@/components/layout/dashboard-header-static';
import { hasUnreadCreatorFeedback } from '@/lib/feedback-store';
import { getUserById } from '@/lib/users-store';
import { unstable_noStore as noStore } from 'next/cache';
import { getSession } from '@/lib/session';
import type { User } from '@/lib/types';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();
  const session = await getSession();
  
  if (!session?.uid) {
    redirect('/login');
  }
  
  const userId = session.uid;
  
  const [hasUnread, dbUser] = await Promise.all([
    hasUnreadCreatorFeedback(userId),
    getUserById(userId),
  ]);

  // Sanitize the user object to be a plain object before passing to client components.
  // This prevents errors with non-serializable data types like MongoDB's ObjectId.
  const user = dbUser ? JSON.parse(JSON.stringify(dbUser)) as User : undefined;

  const channelConnected = !!user?.youtubeChannelId;

  // --- Redirect Logic ---
  const headersList = headers();
  const nextUrl = headersList.get('next-url') || '';
  const pathname = new URL(nextUrl, 'http://localhost').pathname;

  const allowedPathsWithoutConnection = [
      '/dashboard/connect-platform',
      '/dashboard/settings',
      '/dashboard/feedback',
  ];

  if (!channelConnected && !allowedPathsWithoutConnection.includes(pathname)) {
      redirect('/dashboard/connect-platform');
  }
  // --- End Redirect Logic ---

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
