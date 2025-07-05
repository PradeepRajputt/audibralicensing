
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useYouTube } from '@/context/youtube-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Youtube } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isYouTubeConnected } = useYouTube();

  return (
      <SidebarProvider>
          <CreatorSidebar />
          <SidebarInset>
              <DashboardHeader title="Creator Dashboard" />
              <main className="p-4 md:p-6 flex-1 flex flex-col">
                  {isYouTubeConnected ? (
                    children
                   ) : (
                    <ConnectYoutubePlaceholder />
                   )}
              </main>
          </SidebarInset>
      </SidebarProvider>
  );
}

function ConnectYoutubePlaceholder() {
    return (
        <div className="flex-1 flex items-center justify-center">
             <Card className="text-center w-full max-w-lg mx-auto">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        <Youtube className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Connect Your YouTube Account</CardTitle>
                    <CardDescription>To view your dashboard and use monitoring features, please connect your YouTube channel in settings.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <Link href="/dashboard/settings">
                            Go to Settings
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
