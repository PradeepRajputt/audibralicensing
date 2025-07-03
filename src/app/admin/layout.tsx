
import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { hasUnrepliedAdminFeedback } from '@/lib/feedback-store';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/dashboard-header';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      redirect('/login');
    }

    const hasNewFeedback = await hasUnrepliedAdminFeedback();

    return (
      <SidebarProvider>
        <AdminSidebar hasNewFeedback={hasNewFeedback} />
        <SidebarInset>
          <DashboardHeader />
          <main className="p-4 md:p-6">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
}
