
'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession, signIn } from 'next-auth/react';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function DashboardHeader() {
  const { data: session } = useSession();
  
  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session?.user?.image ?? undefined} alt="User Avatar" data-ai-hint="profile picture" />
            <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <LogIn className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="mt-4 text-2xl">Access Your Dashboard</CardTitle>
              <CardDescription>
                Please sign in with your Google account to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => signIn('google')}>
                Sign In with Google
              </Button>
            </CardContent>
          </Card>
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
