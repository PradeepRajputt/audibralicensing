
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '@/context/user-context';
import { usePathname } from 'next/navigation';

export function DashboardHeader() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  
  const getTitle = () => {
    if (pathname.startsWith('/admin')) {
      return 'Admin Dashboard';
    }
    return 'Creator Dashboard';
  }

  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">{getTitle()}</h1>
        <div className="ml-auto">
            {isLoading ? <Skeleton className="h-9 w-9 rounded-full" /> : (
              user && (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar ?? undefined} alt={user.displayName ?? ''} data-ai-hint="profile picture" />
                    <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
              )
            )}
        </div>
     </header>
  );
}
