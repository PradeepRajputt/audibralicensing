
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    if (status === 'authenticated' && session.user.role !== 'admin') {
      router.replace('/dashboard/overview');
    }
  }, [status, session, router]);
  
  if (status === 'loading' || (status==='authenticated' && session.user.role !== 'admin')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'authenticated' && session.user.role === 'admin') {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="p-4 md:p-6 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </header>
          <main className="p-4 md:p-6">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return null;
}
