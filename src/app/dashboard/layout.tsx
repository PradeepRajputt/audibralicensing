'use client';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProvider, useUser } from '@/context/user-context';
import { SuspensionNotice } from '@/components/layout/suspension-notice';
import { Loader2 } from 'lucide-react';

function DashboardHeader() {
  const { avatarUrl } = useUser();
  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="profile picture" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
    </header>
  );
}


function DashboardContent({ children }: { children: React.ReactNode }) {
  const { status, isHydrated } = useUser();

  if (!isHydrated) {
    // Render a loading skeleton to prevent hydration mismatch while we check the user's status.
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (status === 'suspended') {
    return <SuspensionNotice />;
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
