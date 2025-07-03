
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export function DashboardHeaderStatic({ user }: { user: User | undefined }) {
  const isLoading = !user;

  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
        <div className="ml-auto">
            {isLoading ? <Skeleton className="h-9 w-9 rounded-full" /> : (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.displayName ?? ''} data-ai-hint="profile picture" />
                    <AvatarFallback>{user.displayName?.charAt(0) ?? 'C'}</AvatarFallback>
                </Avatar>
            )}
        </div>
     </header>
  );
}
