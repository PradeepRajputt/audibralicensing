

import * as React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { hasUnrepliedAdminFeedback } from '@/lib/feedback-store';
import { unstable_noStore as noStore } from 'next/cache';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';


export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    noStore();
    const session = await getSession();

    if (!session?.uid || session.role !== 'admin') {
      redirect('/login');
    }

    const hasNewFeedback = await hasUnrepliedAdminFeedback();

    return (
      <SidebarProvider>
        <AdminSidebar hasNewFeedback={hasNewFeedback} />
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
