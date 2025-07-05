
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function DashboardHeader() {
  const { user, loading } = useAuth();
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
             {loading ? <Skeleton className="h-10 w-10 rounded-full" /> : user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                         <Avatar className="h-10 w-10">
                           <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} data-ai-hint="profile picture" />
                           <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                         </Avatar>
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuLabel>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                       </DropdownMenuLabel>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={() => signOut(auth)}>
                           <LogOut className="mr-2 h-4 w-4" />
                           Sign out
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
             ) : null}
        </div>
     </header>
  );
}
