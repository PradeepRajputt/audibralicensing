
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/');
        } else if (dbUser && dbUser.role !== 'admin') {
          router.push('/dashboard');
        }
      }
    }, [user, dbUser, loading, router]);

    // Show a loading screen while we verify auth and role
    if (loading || !user || !dbUser || dbUser.role !== 'admin') {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="p-4 md:p-6">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
}
