
import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getUserById } from '@/lib/users-store';
import { DashboardLayoutClient } from './layout-client';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

function DashboardLayoutSkeleton() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
             <Skeleton className="h-16 w-16 rounded-full" />
        </div>
    )
}

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
      {/* The Suspense boundary will show a loading state for the user data */}
      <React.Suspense fallback={<DashboardLayoutSkeleton />}>
        <DashboardLayoutClient user={user} channelConnected={channelConnected}>
            {children}
        </DashboardLayoutClient>
      </React.Suspense>
    </SidebarProvider>
  );
}
