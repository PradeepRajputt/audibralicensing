
import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { hasUnrepliedAdminFeedback } from '@/lib/feedback-store';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { UserProvider } from '@/context/user-context';


export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const hasNewFeedback = await hasUnrepliedAdminFeedback();

    return (
     <UserProvider>
      <SidebarProvider>
        <AdminSidebar hasNewFeedback={hasNewFeedback} />
        <SidebarInset>
          <DashboardHeader />
          <main className="p-4 md:p-6">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
     </UserProvider>
    );
}
