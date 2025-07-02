
import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getUserById } from '@/lib/users-store';
import { getFeedbackForUser } from '@/lib/feedback-store';
import { DashboardLayoutClient } from './layout-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

function DashboardPageSkeleton() {
    return (
        <div className="p-4 md:p-6 space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {[...Array(3)].map((_, i) => (
                    <Card key={i}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-4" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40 mt-2" /></CardContent></Card>
                 ))}
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full max-w-md mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
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
  const userId = "user_creator_123";
  const user = await getUserById(userId);
  const channelConnected = !!user?.youtubeChannelId;
  const userFeedback = await getFeedbackForUser(userId);
  const hasUnreadFeedback = userFeedback.some(f => f.response.length > 0 && !f.isReadByCreator);


  return (
    <SidebarProvider>
        <DashboardLayoutClient 
            user={user} 
            channelConnected={channelConnected}
            hasUnreadFeedback={hasUnreadFeedback}
        >
            <React.Suspense fallback={<DashboardPageSkeleton />}>
                {children}
            </React.Suspense>
        </DashboardLayoutClient>
    </SidebarProvider>
  );
}
