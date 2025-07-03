
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export function AdminLayoutClient({
  children,
  hasNewFeedback
}: {
  children: React.ReactNode;
  hasNewFeedback: boolean;
}) {
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
