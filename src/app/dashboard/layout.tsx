
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { UserProvider } from '@/context/user-context';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';


function DashboardHeader() {
  const { data: session } = useSession();
  const { creatorImage } = useUser();

  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={creatorImage ?? session?.user?.image ?? undefined} alt="User Avatar" />
                  <AvatarFallback>{session?.user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
     </header>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession({
      required: true,
      onUnauthenticated() {
        redirect('/login?callbackUrl=/dashboard');
      },
  });

  const { status: userStatus, setStatus, analytics } = useUser();

  React.useEffect(() => {
    // This is a temporary way to simulate status updates for the demo
    const storedStatus = localStorage.getItem('user_status') as 'active' | 'suspended' | 'deactivated';
    if (storedStatus) {
      setStatus(storedStatus);
    }
  }, [setStatus]);


  if (status === 'loading') {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  // This is a special check for the demo to handle simulated suspended state
  if (userStatus === 'suspended') {
      return (
        <div className="flex h-screen items-center justify-center">
            <p>Your account is suspended. Please contact support.</p>
        </div>
      )
  }
  
  if (userStatus === 'deactivated' || (session?.user as any)?.status === 'deactivated') {
     // A more robust app would use a dedicated page, but a redirect works for now
      redirect('/reactivation');
  }

  // Redirect non-creator roles away from the creator dashboard
  if (session?.user?.role !== 'creator') {
    return redirect('/'); // Or an appropriate 'unauthorized' page
  }

  return (
      <SidebarProvider>
        <CreatorSidebar />
        <SidebarInset>
            <DashboardHeader />
            <main className="p-4 md:p-6">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}
