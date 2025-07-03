
import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
          <CreatorSidebar />
          <SidebarInset>
              <DashboardHeader />
              <main className="p-4 md:p-6 flex-1 flex flex-col">
              {children}
              </main>
          </SidebarInset>
      </SidebarProvider>
  );
}
