
'use client';

import * as React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
        <div className="ml-auto">
            {loading ? <Skeleton className="h-8 w-8 rounded-full" /> : 
             user ? (
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.displayName ?? ''} data-ai-hint="profile picture" />
                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
             ) : (
                <Button variant="outline" onClick={() => router.push('/login')}>Sign In</Button>
             )
            }
        </div>
     </header>
  );
}
