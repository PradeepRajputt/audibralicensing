
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// This is a static version of the header, as auth has been removed.
export function DashboardHeader() {
  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
        <div className="ml-auto">
            <Avatar className="h-9 w-9">
                <AvatarImage src="https://placehold.co/128x128.png" alt="Creator" data-ai-hint="profile picture" />
                <AvatarFallback>C</AvatarFallback>
            </Avatar>
        </div>
     </header>
  );
}
