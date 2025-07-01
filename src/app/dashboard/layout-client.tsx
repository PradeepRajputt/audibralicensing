
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Youtube } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@/lib/types';


function LockedContent() {
    return (
        <div className="flex items-center justify-center h-full p-4">
             <Card className="text-center w-full max-w-lg mx-auto">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        <Youtube className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Connect Your YouTube Channel</CardTitle>
                    <CardDescription>
                       Please connect your YouTube channel to access this feature.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/settings">Go to Settings</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}


export function DashboardLayoutClient({
  user,
  channelConnected,
  children,
}: {
  user: User | undefined;
  channelConnected: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isProtectedPath = !['/dashboard/settings', '/dashboard/overview'].includes(pathname);
  const showLock = isProtectedPath && !channelConnected;

  return (
    <>
      <CreatorSidebar user={user} />
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 md:p-6 flex-1 flex flex-col">
          {showLock ? <LockedContent /> : children}
        </main>
      </SidebarInset>
    </>
  );
}
