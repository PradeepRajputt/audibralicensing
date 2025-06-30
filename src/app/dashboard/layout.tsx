'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signIn } from 'next-auth/react';
import { Loader2, LogIn, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

function DashboardHeader() {
  const { data: session } = useSession();
  
  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
          {!session && (
            <Button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} size="sm">
              <Youtube className="mr-2 h-5 w-5" />
              Sign In with Google
            </Button>
          )}
          {session && (
            <Avatar className="h-9 w-9">
              <AvatarImage src={session.user?.image ?? undefined} alt="User Avatar" data-ai-hint="profile picture" />
              <AvatarFallback>{session.user?.name?.charAt(0) ?? 'C'}</AvatarFallback>
            </Avatar>
          )}
        </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
  );
}
