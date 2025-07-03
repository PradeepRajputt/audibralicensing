
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { useSession } from 'next-auth/react';

export function DashboardHeader() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const title = user?.role === 'admin' ? 'Admin Dashboard' : 'Creator Dashboard';

  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="ml-auto">
            {isLoading ? <Skeleton className="h-9 w-9 rounded-full" /> : (
              user && (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? ''} data-ai-hint="profile picture" />
                    <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
              )
            )}
        </div>
     </header>
  );
}
