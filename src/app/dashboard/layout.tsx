
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SuspensionNotice } from '@/components/layout/suspension-notice';
import { UserProvider } from '@/context/user-context';


function DashboardHeader() {
  return (
     <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold">Creator Dashboard</h1>
     </header>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
      required: true,
      onUnauthenticated() {
        redirect('/login?callbackUrl=/dashboard');
      },
  });

  if (status === 'loading') {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  // This state is now managed client-side in the user-context
  // if (status === 'suspended' || status === 'deactivated') {
  //   return <SuspensionNotice />;
  // }
  
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
